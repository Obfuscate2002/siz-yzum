import type {Division} from "../types/divisions.ts";
import {pb} from "../pocketbase/pocketbase.ts";

interface UpdateDivisionData {
    ppe_positions: string[];
    contract_positions: string[];
}


export const getDivisions = async (): Promise<Division[]> => {
    const data = await pb.collection('divisions').getFullList<Division>({
        requestKey: null,
        expand: 'ppe_positions, contract_positions'
    })
    return data
}

export const updateDivisions = async (id: string, data: UpdateDivisionData): Promise<Division> => {
    const updateDivision = await pb.collection('divisions').update<Division>(id, data,{
        expand: 'ppe_positions, contract_positions'
    })
    return updateDivision

}