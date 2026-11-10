
import {pb} from "../pocketbase/pocketbase.ts";
import type {WarehouseReceiptItem} from "../types/WarehouseReceiptItem.ts";


export const getWarehouseReceiptItems = async (): Promise<WarehouseReceiptItem[]> => {
    const data = pb.collection('warehouse_receipt_items').getFullList<WarehouseReceiptItem>({
        expand: 'receipt, nomenclature'
    })

    return data
}