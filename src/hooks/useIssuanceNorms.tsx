import {pb} from "../pocketbase/pocketbase.ts";
import type {IssuanceNormExpanded} from "../types/norms.ts";


export const getIssuanceNorms = async (): Promise<IssuanceNormExpanded[]> => {
    await pb.collection('users').authWithPassword('admin@siz-yzum.local', 'siz-yzum2026');
    const data = await pb.collection('issuance_norms').getFullList<IssuanceNormExpanded>({
        expand: "position,nomenclature"
    });
    return data;
}

export const getIssuanceNorm = async (positionId: string): Promise<IssuanceNormExpanded[]> => {
    await pb.collection('users').authWithPassword('admin@siz-yzum.local', 'siz-yzum2026');
    const data = await pb.collection('issuance_norms').getFullList<IssuanceNormExpanded>({
        filter: `position = "${positionId}"`,
        expand: "nomenclature",
    });
    return data;
}

export const deleteIssuanceNorm = async (id: string) => {
    await pb.collection('users').authWithPassword('admin@siz-yzum.local', 'siz-yzum2026');
    await pb.collection('issuance_norms').delete(id)
}

