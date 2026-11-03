import {pb} from "../pocketbase/pocketbase.ts";

type PppeItem = {
    id: string;
    created: string;
    updated: string;
    name: string;
    category: string;
    unit: string;
    description: string
    isActive: boolean;
}

export const getNorms = async (): Promise<PppeItem[]> => {
    const data = await pb.collection('norms_catalog').getFullList<PppeItem>();
    return data;
}