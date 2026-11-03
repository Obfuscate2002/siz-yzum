import {pb} from "../pocketbase/pocketbase.ts";

type PpeNomenclature = {
    id: string;
    name: string;
    number: string;
    type: string;
    gender: 'Мужской' | 'Женский' | 'Универсальный';
    is_archived: boolean;
    use_barcode: boolean;
    barcode: string;
    comment: string;
};

export const getPpeNomenclatures = async (): Promise<PpeNomenclature[]> => {
    const data = await pb.collection('siz_nomenclature').getFullList<PpeNomenclature>();
    return data;
}