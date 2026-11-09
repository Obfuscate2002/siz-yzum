export interface WarehouseReceiptItem {
    id: string;
    receipt: string;
    productCode: string;
    nomenclature?: string;
    productName: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    amountWithoutTax: number;
    taxRate: number;
    taxAmount: number;
    amountWithTax: number;
    created: string;
    updated: string;

    expand?: {
        receipt?: {
            id: string;
            documentNumber: string;
            receiptDate: string;
            counterparty: string;
        };
        nomenclature?: {
            id: string;
            name: string;
        };
    };
}