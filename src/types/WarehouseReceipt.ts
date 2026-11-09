export interface WarehouseReceipt {
    id: string;
    documentNumber: string;
    receiptDate: string;
    supplier?: string;
    basis?: string;
    status: ReceiptStatus;
    created: string;
    updated: string;
}

export type ReceiptStatus =
    | 'draft'
    | 'pending'
    | 'completed'
    | 'cancelled';
