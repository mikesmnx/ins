import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TimeHelper } from 'src/app/helpers/time.helper';
import { DbItem } from 'src/app/models/db.item';
import { DurationType } from 'src/app/models/duration-type';
import { Shift } from 'src/app/models/shift';

type PartialShift = Pick<Shift, 'clockIn' | 'clockOut' | 'id'>;

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeDetailComponent implements OnInit, OnDestroy {
  @Input() employeeData!: DbItem;

  @Output() employeeChangeEvent: EventEmitter<DbItem> =
    new EventEmitter<DbItem>();

  public name!: FormControl;
  public email!: FormControl;
  public hourlyRate!: FormControl;
  public hourlyRateOvertime!: FormControl;
  public date!: FormControl;

  public shiftDataFull: PartialShift[] = [];
  public shiftData: PartialShift[] = [];
  public displayedColumns: string[] = ['position', 'shifteditor', 'shiftlen'];
  public DurationType = DurationType;

  private sub: Subscription = new Subscription();

  ngOnInit(): void {
    this.shiftDataFull = Array.from(this.employeeData?.shifts, ([k, v]) => ({
      clockIn: v.clockIn,
      clockOut: v.clockOut,
      id: v.id,
    }));

    this.shiftDataFull.sort((a, b) => a?.clockIn - b?.clockIn);

    if (this.shiftDataFull.length) {
      this.date = new FormControl(new Date(this.shiftDataFull[0].clockOut));

      this.shiftData = this.getFilteredData();
    }

    this.sub = this.date.valueChanges.subscribe(() => {
      this.shiftData = this.getFilteredData();
    });
  }

  onShiftChange(partialShift: PartialShift): void {
    this.employeeData?.shifts.set(partialShift.id, {
      ...partialShift,
      employeeId: this.employeeData.employee.id,
    });

    this.employeeChangeEvent.emit(this.employeeData);
  }

  getFilteredData(): PartialShift[] {
    const dateStart = TimeHelper.getStartDayTimestamp(this.date.value);
    const dateFinish = TimeHelper.getStartDayTimestamp(this.date.value, 1);

    return this.shiftDataFull.filter((shift) => {
      if (
        (shift.clockIn >= dateStart && shift.clockIn <= dateFinish) ||
        (shift.clockOut >= dateStart && shift.clockOut <= dateFinish)
      ) {
        return true;
      }

      return false;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
