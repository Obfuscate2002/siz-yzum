import {pb} from "../pocketbase/pocketbase.ts";
import type {PpeIssuanceStandardExpanded} from "../types/ppeIssuanceStandards.ts";


export const getPpeIssuanceStandards = async (): Promise<PpeIssuanceStandardExpanded[]> => {
    await pb.collection('users').authWithPassword('admin@siz-yzum.local', 'siz-yzum2026');
    const data = await pb.collection('ppe_issuance_standards').getFullList<PpeIssuanceStandardExpanded>({
        expand: "position"
    });
    return data;
}