import {pb} from "../pocketbase/pocketbase.ts";
import type { Employee } from "../types/employee.ts";


export const getEmployes = async (): Promise<Employee[]> => {
        const data = await pb.collection('employees').getFullList<Employee>({
            requestKey: null,
            expand: 'positionRelation,division,contractPosition'
        });
        return data;
}