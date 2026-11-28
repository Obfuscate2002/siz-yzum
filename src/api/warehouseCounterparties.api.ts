import {pb} from "../pocketbase/pocketbase.ts";
import type {WarehouseСounterpartie} from "../types/WarehouseСounterpartie.ts";

export type CreateWarehouseCounterparties = Pick<WarehouseСounterpartie, 'name' | 'inn' | 'kpp'>

type UpdateWarehouseCounterpartie = {
    id: string;
    name: string;
    inn: string;
    kpp: string;
};

export const getWarehouseCounterparties = async (): Promise<WarehouseСounterpartie[]> => {
    const data = await pb.collection('counterparty_directory').getFullList<WarehouseСounterpartie>()
    return data
}

export const createWarehouseCounterpartie = async (warehouseCounterpartie: CreateWarehouseCounterparties): Promise<void> => {
   await pb.collection('counterparty_directory').create({
        name: warehouseCounterpartie.name,
        kpp: warehouseCounterpartie.kpp,
        inn: warehouseCounterpartie.inn,
    })
}

export const deleteWarehouseCounterpartie = async (id: string): Promise<void> => {
    await pb.collection('counterparty_directory').delete(id)
}

export const updateWarehouseCounterpartie = async ({id, name, inn, kpp}: UpdateWarehouseCounterpartie) => {
    await pb.collection('counterparty_directory').update(id, {
        name,
        kpp,
        inn
    })
}