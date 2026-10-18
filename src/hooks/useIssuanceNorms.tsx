import {pb} from "../pocketbase/pocketbase.ts";
import type {CreateIssuanceNormItem, IssuanceNormExpanded, IssuanceNormHeaderExpanded} from "../types/norms.ts";


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
        expand: "nomenclature,position",
    });
    return data;
}

//////////////////////////////////////////////////////////// новые
export const getIssuanceNormHeaders = async (): Promise<IssuanceNormHeaderExpanded[]> => {
    await pb.collection('users').authWithPassword('admin@siz-yzum.local', 'siz-yzum2026');
    return await pb
        .collection("issuance_norm_headers")
        .getFullList<IssuanceNormHeaderExpanded>({
            expand: "position",
        });
};

export const getIssuanceNormItems = async (
    headerId: string,
): Promise<IssuanceNormExpanded[]> => {
    return await pb
        .collection("issuance_norms")
        .getFullList<IssuanceNormExpanded>({
            filter: `issuance_norm = "${headerId}"`,
            expand: "position,nomenclature,issuance_norm",
            requestKey: null,
        });
};




export const deleteIssuanceNorm = async (id: string): Promise<void> => {
    await pb.collection('users').authWithPassword('admin@siz-yzum.local', 'siz-yzum2026');
    await pb.collection("issuance_norms").delete(id);
};

export const createIssuanceNormItem = async (item: CreateIssuanceNormItem): Promise<IssuanceNormExpanded> => {
    const data = await pb.collection('issuance_norms').create<IssuanceNormExpanded>(item)
    return data
}


