import {pb} from "../pocketbase/pocketbase.ts";
import type {ContractPosition} from "../types/contractPositions.ts";

export const getContractPositions = async (): Promise<ContractPosition[]> => {
    const data = await pb.collection('contract_positions').getFullList<ContractPosition>({
        requestKey: null,
        expand: 'division'
    })
    return data
}