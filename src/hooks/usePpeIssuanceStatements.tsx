import {pb} from "../pocketbase/pocketbase.ts";
import type {PpeIssuanceStatement} from "../types/PpeIssuanceStatement.ts";

export const getPpeIssuanceStatements = async (): Promise<PpeIssuanceStatement[]> => {
    const data = await pb.collection('ppe_issuance_statements').getFullList<PpeIssuanceStatement>({
        expand: 'division, responsibleEmployee'
    })

    return data
}