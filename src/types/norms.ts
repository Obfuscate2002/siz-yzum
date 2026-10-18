export interface IssuanceNorm {
    id: string;
    position: string;
    nomenclature: string;
    issuance_norm: string;
    quantity: number;
    period_months: number;
    estimated_cost: number;
    comment: string;
    issuance_basis: string;
    created?: string;
    updated?: string;
}

export interface IssuanceNormExpanded extends IssuanceNorm {
    expand?: {
        position?: {
            id: string;
            name: string;
        };
        nomenclature?: {
            id: string;
            name: string;
        };
        issuance_norm?: IssuanceNormHeaderExpanded;
    };
}

export interface IssuanceNormHeader {
    id: string;
    position: string;
    name: string;
    period_months: number;
    condition: string;
    norm_point: string;
    comment: string;
    created?: string;
    updated?: string;
}

export interface IssuanceNormHeaderExpanded extends IssuanceNormHeader {
    expand?: {
        position?: {
            id: string;
            name: string;
        };
    };
}

export interface CreateIssuanceNormItem {
    issuance_norm: string;
    nomenclature: string;
    quantity: number;
    period_months: number;
    issuance_basis: string;
    comment?: string;
}