import {pb} from "../pocketbase/pocketbase.ts";
import type { Employees } from "../types/employee.ts";


export const getEmployes = async (): Promise<Employees[]> => {
        await pb.collection('users').authWithPassword('admin@siz-yzum.local', 'siz-yzum2026');
        const data = await pb.collection('employees').getFullList<Employees>({
            expand: 'positionRelation'
        });
        return data;
}