export interface PpeIssuanceStatement {
    id: string;
    statementNumber: string;
    statementDate: string;
    division: string;
    responsibleEmployee?: string;
    employee: string;
    basis?: string;
    status: StatementStatus;
    created: string;
    updated: string;
    expand?: {
        division?: { id: string; name: string };
        employee?: {
            id: string;
            fullName: string;
            personnelNumber: string;
            positionRelation: string;
            contractPosition: string;
            expand?: {
                positionRelation?: { id: string; name: string };
                contractPosition?: { id: string; name: string };
            };
        };
    };
}

export type StatementStatus =
    | "draft"
    | "formed"
    | "completed"
    | "cancelled";