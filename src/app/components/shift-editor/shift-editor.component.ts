import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Shift } from 'src/app/models/shift';

@Component({
  selector: 'app-shift-editor',
  templateUrl: './shift-editor.component.html',
  styleUrls: ['./shift-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShiftEditorComponent implements OnInit {
  @Input() shift!: Shift;
  @Input() baseDate = 0;

  @Output() shiftChangeEvent: EventEmitter<Shift> = new EventEmitter<Shift>();

  public editMode = false;
  public shiftStart = 0;
  public shiftEnd = 0;

  ngOnInit(): void {
    if (this.shift) {
      this.shiftStart = this.shift.clockIn;
      this.shiftEnd = this.shift.clockOut;
    }
  }

  setNewTimestamp(prop: 'clockIn' | 'clockOut', timestamp: number): void {
    if (prop === 'clockIn') {
      this.shiftStart = timestamp;
    }
    else if (prop === 'clockOut') {
      this.shiftEnd = timestamp;
    }
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
  }

  applyChanges(): void {
    this.editMode = false;

    this.shift.clockIn = this.shiftStart;
    this.shift.clockOut = this.shiftEnd;

    this.shiftChangeEvent.emit(this.shift);
  }
}
