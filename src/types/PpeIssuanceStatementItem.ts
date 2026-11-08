export type WearPeriodUnit = 'day' | 'month' | 'year';

export interface PpeIssuanceStatementItem {
    id: string;
    statement: string;
    employee: string;
    nomenclature: string;
    warehouse_nomenclature: string;
    quantity: number;
    unit: string;
    contractPosition: string;
    wearPeriod?: number;
    wearPeriodUnit?: WearPeriodUnit;
    issueDate?: string;
    comment?: string;
    created: string;
    updated: string;

    expand?: {
        contractPosition?: {
            id: string;
            name: string;
        },
        warehouse_nomenclature?: {
            id: string;
            name: string;
        },
        employee?: {
            id: string;
            name: string;
        }

    }
}