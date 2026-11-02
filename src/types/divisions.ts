
export interface Division {
    id: string;
    name: string;
    ppe_positions: string[];
    contract_positions: string[];
    created: string;
    updated: string;
    expand?: {
        ppe_positions?: Array<{
            name: string;
            id: string;
        }>,
        contract_positions?: Array<{
            name: string;
            id: string;
        }>
    }
}

