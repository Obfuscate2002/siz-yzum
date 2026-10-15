import {pb} from "../pocketbase/pocketbase.ts";

type Employees = {
    id: string;
    fullName: string
    position: string
    unit: string
    personnelNumber: string
}

export const getEmployes = async (): Promise<Employees[]> => {
        await pb.collection('users').authWithPassword('admin@siz-yzum.local', 'siz-yzum2026');
        const data = await pb.collection('employees').getFullList<Employees>();
        return data;
}