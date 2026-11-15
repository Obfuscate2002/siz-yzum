import {useQuery} from "@tanstack/react-query";
import {getCounterparties} from "../api/counterparties.api.ts";

export const counterpartiesKey = ['counterparties']

export const useCounterparties = () => {
    return useQuery({
        queryKey: counterpartiesKey,
        queryFn: getCounterparties
    })
}