import {useQuery} from "@tanstack/react-query";
import {getPositions} from "../api/ppePositions.api.ts";


export const ppePositionsKey = ['positions']

export const usePpePositions = () => {
    return useQuery({
        queryKey: ppePositionsKey,
        queryFn: getPositions
    })
}