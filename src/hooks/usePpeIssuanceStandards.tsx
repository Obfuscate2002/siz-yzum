import {pb} from "../pocketbase/pocketbase.ts";
import type {PpeIssuanceStandardExpanded} from "../types/ppeIssuanceStandards.ts";


export const getPpeIssuanceStandards = async (): Promise<PpeIssuanceStandardExpanded[]> => {
    const data = await pb.collection('ppe_issuance_standards').getFullList<PpeIssuanceStandardExpanded>({
        requestKey: null,
        expand: "position"
    });
    return data;
}