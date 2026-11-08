import {pb} from "../pocketbase/pocketbase.ts";
import type {WarehouseNomenclature} from "../types/WarehouseNomenclature.ts";


export const getWarehouseNomenclatures = async (): Promise<WarehouseNomenclature[]> => {
    const data = await pb.collection('warehouse_nomenclature').getFullList<WarehouseNomenclature>({})
    return data;
}