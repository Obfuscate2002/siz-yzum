import {useQuery} from "@tanstack/react-query";
import {getEmployes} from "../api/employees.api.ts";


export const employeesKey = ['employees'];

export const useEmployees = () => {
    return useQuery({
        queryKey: employeesKey,
        queryFn: getEmployes,
    })
}