export interface IssuanceNorm {
    id: string;
    position: string;
    nomenclature: string;
    quantity: number;
    period_months: number;
    estimated_cost: number;
    comment: string;
    created?: string;
    updated?: string;
}

export interface IssuanceNormExpanded extends IssuanceNorm {
    expand?: {
        position: {
            id: string;
            name: string;
        },
        nomenclature: {
            id: string;
            name: string;
        }
    }
}