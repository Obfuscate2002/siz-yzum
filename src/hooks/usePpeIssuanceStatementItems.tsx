import type {PpeIssuanceStatementItem} from "../types/PpeIssuanceStatementItem.ts";
import {pb} from "../pocketbase/pocketbase.ts";

export const getPpeIssuanceStatementItems = async (): Promise<PpeIssuanceStatementItem[]> => {
    const data = await pb.collection('ppe_issuance_statement_items').getFullList<PpeIssuanceStatementItem>({
        expand: 'statement, employee, warehouse_nomenclature, contractPosition'
    })
    return data
}