import {pb} from "../pocketbase/pocketbase.ts";


export interface Counterparty {
    id: string;
    name: string;
    inn: string;
    kpp: string;
}

export const getCounterparties = async (): Promise<Counterparty[]> => {
    const records = await pb.collection("counterparty_directory").getFullList({
            sort: "name",
        });

    return records.map(record => ({
        id: record.id,
        name: String(record.name ?? "").trim(),
        inn: String(record.inn ?? "").trim(),
        kpp: String(record.kpp ?? "").trim(),
    }));
};