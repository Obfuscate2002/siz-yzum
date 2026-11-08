export interface PpeIssuanceStatement {
    id: string;
    statementNumber: string;
    statementDate: Date;
    division: string;
    responsibleEmployee: string;
    basis: string;
    status: StatementStatus;
    created: string;
    updated: string;
}

export type StatementStatus =
    | 'draft'
    | 'formed'
    | 'completed'
    | 'cancelled';