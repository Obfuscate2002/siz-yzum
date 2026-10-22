

import { pb } from "../pocketbase/pocketbase";

export interface Position {
    id: string;
    name: string;
    code?: string;
    profession?: string;
}

export interface PpeIssuanceStandard {
    id: string;
    position: string;
    position_name: string;
    ppe_type: string;
    ppe_name: string;
    issuance_norm: string;
    issuance_basis: string;
}

// Все должности справочника
export const getPositions = async (): Promise<Position[]> => {
    return pb.collection("positions").getFullList<Position>({
        sort: "name",
    });
};

// Все нормы СИЗ для одной выбранной должности
export const getPositionPpeStandards = async (
    positionId: string
): Promise<PpeIssuanceStandard[]> => {
    return pb.collection("ppe_issuance_standards")
        .getFullList<PpeIssuanceStandard>({
            filter: pb.filter("position = {:positionId}", { positionId }),
            sort: "ppe_name",
        });
};
//Здесь фильтр идёт по ID связи position, а не по тексту position_name. Это надёжнее, поскольку текстовое название может различаться.