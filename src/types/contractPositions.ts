
export interface ContractPosition {
    id: string;
    name: string;
    division: string;
    exception_employee: string;
    created: string;
    updated: string;
    expand?: {
        division?: {
            id: string;
            name: string;
        }
    }
}

