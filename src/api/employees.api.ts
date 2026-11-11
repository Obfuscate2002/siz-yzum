import {pb} from "../pocketbase/pocketbase.ts";
import type { Employee } from "../types/employee.ts";


export const getEmployes = async (): Promise<Employee[]> => {
    await pb.collection('users').authWithPassword('admin@siz-yzum.local', 'siz-yzum2026');
    const data = await pb.collection('employees').getFullList<Employee>({
        requestKey: null,
        expand: 'positionRelation,division,contractPosition'
    });
    return data;
}

export const createEmployee = async (employee: Employee): Promise<void> => {

    console.log("Отправляем в PocketBase:", employee);
    const data = await pb.collection('employees').create({
        fullName: employee.fullName,
        contractPosition: employee.contractPosition,
        positionRelation: employee.positionRelation,
        division: employee.division,
        personnelNumber: employee.personnelNumber,
        date_of_employment: employee.date_of_employment,
        comment: employee.comment,
        shoeSize: employee.shoeSize,
        clothingSize: employee.clothingSize,
        height: employee.height,
    })

    console.log("Возвращается с бэка PocketBase:", data);
}

export const updateEmployee = async (id: string, data: Partial<Employee>): Promise<Employee> => {
    return  await pb.collection('employees').update(id, data, {
        expand: 'positionRelation,division,contractPosition'
    })
}

export const deleteEmployee = async (id: string): Promise<void> => {
    await pb.collection('employees').delete(id)
}