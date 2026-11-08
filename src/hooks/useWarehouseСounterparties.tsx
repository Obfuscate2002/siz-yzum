import {pb} from "../pocketbase/pocketbase.ts";
import type {WarehouseСounterpartie} from "../types/WarehouseСounterpartie.ts";


export const getWarehouseСounterparties = async (): Promise<WarehouseСounterpartie[]> => {
    const data = await pb.collection('counterparty_directory').getFullList<WarehouseСounterpartie>({})

    return data
}