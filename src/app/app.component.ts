import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { finalize, forkJoin, take } from 'rxjs';
import { Employee } from './models/employee';
import { Shift } from './models/shift';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  public employees: Employee[] = [];
  public shifts: Shift[] = [];
  public isLoading = true;

  constructor(private dataService: DataService, private ref: ChangeDetectorRef) {}

  ngOnInit(): void {
    forkJoin({
      employees: this.dataService.fetchEmployees(),
      shifts: this.dataService.fetchShifts(),
    })
    .pipe(
      take(1),
      finalize(() => {
        this.isLoading = false;
        this.ref.detectChanges();
      }),
    )
    .subscribe(data => {
      this.employees = data.employees;
      this.shifts = data.shifts;

      this.dataService.initDb(this.employees, this.shifts);
    });
  }
}
