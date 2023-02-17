import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TimeHelper } from '../helpers/time.helpes';
import { DbItem } from '../models/db.item';
import { Employee, EmployeeDetail } from '../models/employee';
import { Shift } from '../models/shift';

const apiURL = 'http://localhost:4200';
const overTimeLimit = 60 * 60 * 8 * 1000;

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private db: Map<string, DbItem> = new Map<string, DbItem>();

  public totalTime$: BehaviorSubject<number> = new BehaviorSubject(0);
  public paidRegularTime$: BehaviorSubject<number> = new BehaviorSubject(0);
  public paidOverTime$: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor(private http: HttpClient) {}

  public fetchEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(
      `${apiURL}/employees/?_sort=name&_order=asc`
    );
  }

  public fetchShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(`${apiURL}/shifts/?_sort=start&_order=asc`);
  }

  public initDb(employees: Employee[], shifts: Shift[]): void {
    employees.forEach((employee) => {
      this.db.set(employee.id, {
        employee,
        shifts: new Map(),
      });
    });

    shifts.forEach((shift, i) => {
      const employee = this.db.get(shift.employeeId);

      employee?.shifts.set(shift.id, shift);
    });
  }

  public getEmployeeNames(): EmployeeDetail[] {
    return Array.from(this.db, ([id, val]) => ({
      id,
      name: val.employee.name,
      email: val.employee.email,
      regularTime: val.workData?.regularTime || 0,
      overTime: val.workData?.overTime || 0,
      hourlyRate: val.employee.hourlyRate,
      hourlyRateOvertime: val.employee.hourlyRateOvertime,
    }));
  }

  public getEmployee(id: string): DbItem {
    const employee = this.db.get(id);
    
    if (!employee) {
      throw Error('db error');
    }

    return employee;
  }

  public updateEmployee(dbItem: DbItem): void {
    const employee = this.getEmployee(dbItem.employee.id);

    employee.employee = dbItem.employee;
    employee.shifts = dbItem.shifts;
  }

  public getDbStats(): void {
    let totalTime = 0;
    let paidRegularTime = 0;
    let paidOverTime = 0;

    this.db.forEach((dbItem) => {
      const totalTimeByDays = new Map<string, number>();

      dbItem.shifts.forEach((shift) => {
        totalTime += TimeHelper.getHoursFromMsec((shift.clockOut - shift.clockIn));

        const startDay = TimeHelper.getDate(shift.clockIn);
        const endDay = TimeHelper.getDate(shift.clockOut);

        if (!totalTimeByDays.get(startDay)) {
          totalTimeByDays.set(startDay, 0);
        }

        if (!totalTimeByDays.get(endDay)) {
          totalTimeByDays.set(endDay, 0);
        }

        if (startDay === endDay) {
          totalTimeByDays.set(
            startDay,
            (totalTimeByDays.get(startDay) || 0) +
              (shift.clockOut - shift.clockIn)
          );
        } else {
          const startOfEndDay = TimeHelper.getStartDayTimestamp(shift.clockOut);

          totalTimeByDays.set(
            startDay,
            (totalTimeByDays.get(startDay) || 0) +
              (startOfEndDay - shift.clockIn)
          );

          totalTimeByDays.set(
            endDay,
            (totalTimeByDays.get(endDay) || 0) +
              (shift.clockOut - startOfEndDay)
          );
        }
      });

      let overTime = 0;
      let regularTime = 0;

      totalTimeByDays.forEach((dayTime) => {
        if (dayTime > overTimeLimit) {
          overTime += TimeHelper.getHoursFromMsec(dayTime - overTimeLimit);
          regularTime = TimeHelper.getHoursFromMsec(overTimeLimit);
        } else {
          regularTime += TimeHelper.getHoursFromMsec(dayTime);
        }
      });

      dbItem.workData = {
        overTime,
        regularTime,
      };
    });

    this.db.forEach((dbItem) => {
      paidRegularTime +=
        (dbItem.workData?.regularTime || 0) * dbItem.employee.hourlyRate;
      paidOverTime +=
        (dbItem.workData?.overTime || 0) * dbItem.employee.hourlyRateOvertime;
    });

    this.totalTime$.next(totalTime);
    this.paidRegularTime$.next(paidRegularTime);
    this.paidOverTime$.next(paidOverTime);
  }
}
