import { WorkData } from "./workdata";

export interface Employee {
  email: string;
  hourlyRate: number;
  hourlyRateOvertime: number;
  id: string;
  name: string;
}

export type EmployeeDetail = Employee & WorkData;