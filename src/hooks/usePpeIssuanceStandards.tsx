import {useQuery} from "@tanstack/react-query";
import {getPpeIssuanceStandards} from "../api/ppeIssuanceStandards.api.ts";

export const ppeIssuanceStandardsKey = ['ppe_issuance_standards']

export const usePpeIssuanceStandards = () => {
    return useQuery({
        queryKey: ppeIssuanceStandardsKey,
        queryFn: getPpeIssuanceStandards
    })
}