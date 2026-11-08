

export interface WarehouseNomenclature {
    id: string;
    name: string;
    type: NomenclatureType;
    productCode: string;
    quantity: number;
    unit: string;
    created: string;
    updated: string;
}

export type NomenclatureType =
    | 'ОДЕЖДА'
    | 'ОБУВЬ'
    | 'ГОЛОВНЫЕ УБОРЫ'
    | 'СРЕДСТВА ЗАЩИТЫ'
    | 'ПЕРЧАТКИ'
    | 'РЕСПИРАТОРЫ'
    | 'СМЫВАЮЩИЕ СРЕДСТВА';

