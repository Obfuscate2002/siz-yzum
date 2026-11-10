import {useQuery} from "@tanstack/react-query";
import {getDivisions} from "../api/divisions.api.ts";


export const divisionsKey = ['divisions']

export const useDivisions = () => {
    return useQuery({
        queryKey: divisionsKey,
        queryFn: getDivisions,
    })
}