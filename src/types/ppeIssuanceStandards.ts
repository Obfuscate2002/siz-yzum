


export interface PpeIssuanceStandard {
    id: string;
    ppe_type: string;
    ppe_name: string;
    issuance_norm: string;
    issuance_basis: string;
    position_name: string;
    created: string;
    updated: string;
}


export interface PpeIssuanceStandardExpanded extends PpeIssuanceStandard {
    expand?: {
        position?: {
            id: string;
            name: string;
        }
    }
}