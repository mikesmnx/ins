import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { combineLatest } from 'rxjs';
import { TimeHelper } from 'src/app/helpers/time.helper';

@Component({
  selector: 'app-time-editor',
  templateUrl: './time-editor.component.html',
  styleUrls: ['./time-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeEditorComponent implements OnInit, OnDestroy {
  @Input() timestamp = 0;
  @Input() baseDate = 0;
  @Input() allowPrevDay = false;
  @Input() allowNextDay = false;
  @Input() minValue = 0;
  @Input() maxValue = Infinity;

  @Output() timeChangedEvent: EventEmitter<number> = new EventEmitter();

  public timeEditForm: FormGroup = new FormGroup({});
  public selectedTime!: FormControl;
  public otherDay!: FormControl;
  public dayDiff = 0;
  public currentDay = '';

  private valueSub: Subscription = new Subscription();

  ngOnInit(): void {
    this.selectedTime = new FormControl(TimeHelper.getTime(this.timestamp), [
      Validators.required,
      Validators.maxLength(5),
      Validators.minLength(3),
      Validators.pattern(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/),
    ]);

    if (this.allowNextDay) {
      this.dayDiff = 1;
    } else if (this.allowPrevDay) {
      this.dayDiff = -1;
    }

    this.otherDay = new FormControl(
      TimeHelper.getStartDayTimestamp(this.timestamp) !==
        TimeHelper.getStartDayTimestamp(this.baseDate)
    );

    if (this.otherDay.value) {
      this.currentDay = TimeHelper.getDate(
        TimeHelper.getStartDayTimestamp(this.baseDate, this.dayDiff)
      );
    }

    this.timeEditForm.addControl('selectedTime', this.selectedTime);
    this.timeEditForm.addControl('otherDay', this.otherDay);

    this.valueSub = combineLatest([
      this.timeEditForm.valueChanges,
      this.timeEditForm.statusChanges,
    ])
      .pipe(distinctUntilChanged())
      .subscribe(([value, status]) => {
        if (status === 'VALID') {
          const startDayTimestamp = TimeHelper.getStartDayTimestamp(
            this.baseDate,
            value.otherDay ? this.dayDiff : 0
          );
          this.currentDay = TimeHelper.getDate(startDayTimestamp);

          this.timeChangedEvent.emit(
            TimeHelper.getNewTimestamp(startDayTimestamp, value.selectedTime)
          );
        }
      });
  }

  ngOnDestroy(): void {
    this.valueSub.unsubscribe();
  }
}
