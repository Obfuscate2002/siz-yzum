import {pb} from "../pocketbase/pocketbase.ts";


export interface WarehouseNomenclature {
    id: string;
    name: string;
    type: string;
    productCode: string;
    quantity: number;
    unit: string;
}

export const getWarehouseNomenclature = async (): Promise<WarehouseNomenclature[]> => {
    const records = await pb
        .collection("warehouse_nomenclature")
        .getFullList({
            sort: "name",
        });

    return records.map(record => ({
        id: record.id,
        name: String(record.name ?? ""),
        type: String(record.type ?? ""),
        productCode: String(record.productCode ?? ""),
        quantity: Number(record.quantity ?? 0),
        unit: String(record.unit ?? ""),
    }));
};