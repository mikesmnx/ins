import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DbItem } from 'src/app/models/db.item';

@Component({
  selector: 'app-modal-view',
  templateUrl: './modal-view.component.html',
  styleUrls: ['./modal-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalViewComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { selection: DbItem[] }
  ) {}
}
