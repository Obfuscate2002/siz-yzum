import {pb} from "../pocketbase/pocketbase.ts";
import type {SizNomenclature} from "../types/sizNomenclature.ts";


export const getSizNomenclature = async () : Promise<SizNomenclature[]> => {
    await pb.collection('users').authWithPassword('admin@siz-yzum.local', 'siz-yzum2026');
    const data = await pb.collection("siz_nomenclature").getFullList<SizNomenclature>({
        filter: 'is_archived = false',
        sort: 'name'
    })
    return data
}