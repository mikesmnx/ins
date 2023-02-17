import { SelectionModel } from '@angular/cdk/collections';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, tap } from 'rxjs/operators';
import { DbItem } from 'src/app/models/db.item';
import { DurationType } from 'src/app/models/duration-type';
import { Employee, EmployeeDetail } from 'src/app/models/employee';
import { DataService } from 'src/app/services/data.service';
import { ModalViewComponent } from '../modal-view/modal-view.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  public db: Map<string, DbItem> = new Map();

  public employees: EmployeeDetail[] = [];

  public totalClockedInTime = 0;
  public totalRegularTime = 0;
  public totalOverTime = 0;

  public DurationType = DurationType;

  public displayedColumns: string[] = [
    'select',
    'position',
    'employee',
    'email',
    'total',
    'regular',
    'overtime',
  ];
  public selection = new SelectionModel<Employee>(true, []);

  constructor(
    private dialog: MatDialog,
    private ref: ChangeDetectorRef,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.dataService.getDbStats();

    this.employees = this.dataService.getEmployeeNames();

    this.dataService.totalTime$
      .pipe(tap((time) => (this.totalClockedInTime = time)))
      .subscribe();

    this.dataService.paidRegularTime$
      .pipe(
        tap((time) => {
          this.totalRegularTime = time;
        })
      )
      .subscribe();

    this.dataService.paidOverTime$
      .pipe(tap((time) => (this.totalOverTime = time)))
      .subscribe();
  }

  bulkEdit(): void {
    const dialogRef = this.dialog.open(ModalViewComponent, {
      width: '1000px',
      minWidth: '1000px',
      data: {
        selection: this.selection.selected.map((i) =>
          this.dataService.getEmployee(i.id)
        ),
      },
    });

    dialogRef
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe((updatedData: DbItem[]) => {
        this.selection.clear();

        updatedData.forEach((dbItem) => {
          this.dataService.updateEmployee(dbItem);
        });

        this.dataService.getDbStats();
        
        this.employees = this.dataService.getEmployeeNames();

        this.ref.detectChanges();
      });
  }
}
