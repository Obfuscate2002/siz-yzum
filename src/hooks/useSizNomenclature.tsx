import {pb} from "../pocketbase/pocketbase.ts";
import type {SizNomenclature} from "../types/sizNomenclature.ts";


export const getSizNomenclature = async () : Promise<SizNomenclature[]> => {
    const data = await pb.collection("siz_nomenclature").getFullList<SizNomenclature>({
        filter: 'is_archived = false',
        sort: 'name'
    })
    return data
}