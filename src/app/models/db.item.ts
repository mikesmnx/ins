import { Employee } from "./employee";
import { Shift } from "./shift";
import { WorkData } from "./workdata";

export interface DbItem {
    employee: Employee;
    shifts: Map<string, Shift>;
    workData?: WorkData;
}