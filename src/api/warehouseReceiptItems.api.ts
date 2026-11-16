
import {pb} from "../pocketbase/pocketbase.ts";
import type {WarehouseReceiptItem} from "../types/WarehouseReceiptItem.ts";


export const getWarehouseReceiptItems = async (): Promise<WarehouseReceiptItem[]> => {
    const data = pb.collection('warehouse_receipt_items').getFullList<WarehouseReceiptItem>({
        expand: "receipt,nomenclature",
        sort: "-created",
    })

    return data
}

export const deleteWarehouseReceiptItems = async (receiptId: string) => {
    const items = await pb.collection("warehouse_receipt_items").getFullList({
        filter: `receipt = "${receiptId}"`,
    });

    await Promise.all(
        items.map((item) =>
            pb.collection("warehouse_receipt_items").delete(item.id)
        )
    );
};