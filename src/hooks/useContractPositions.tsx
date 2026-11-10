import { useQuery } from "@tanstack/react-query"
import {getContractPositions} from "../api/contractPositions.api.ts";



export const contractPositionKey = ['contractPosition']

export const useContractPositions = () => {
    return useQuery({
        queryKey: contractPositionKey,
        queryFn: getContractPositions,
    })
}