
import type { ReceiptItem } from "../components/warehouseReceipt/WarehouseReceiptItemsTable";
import type { WarehouseReceiptDetailsValues } from "../components/warehouseReceipt/WarehouseReceiptDetailsForm";
import {pb} from "../pocketbase/pocketbase.ts";

export interface WarehouseReceipt {
    id: string;
    documentNumber: string;
    receiptDate: string;
    basis: string;
    counterparty: string;
    status: "draft" | "pending" | "completed" | "cancelled";
    created: string;
    updated: string;

    expand?: {
        counterparty?: {
            id: string;
            name: string;
            inn: string;
            kpp: string;
        };
    };
}

// Получение списка накладных
export const getWarehouseReceipts = async (): Promise<WarehouseReceipt[]> => {
    return await pb.collection("warehouse_receipts").getFullList<WarehouseReceipt>({
        sort: "-receiptDate",
        expand: "counterparty",
    });
};

// Создание накладной вместе с товарными позициями
export const createWarehouseReceipt = async (
    values: WarehouseReceiptDetailsValues,
    items: ReceiptItem[]
) => {
    // 1. Создаём шапку накладной
    const receipt = await pb.collection("warehouse_receipts").create(
        {
            documentNumber: values.documentNumber,
            receiptDate: values.receiptDate.toISOString(),
            basis: values.basis ?? "",
            counterparty: values.counterparty,
            status: "draft",
        },
        {
            requestKey: null,
        }
    );

    const createdItemIds: string[] = [];

    try {
        // 2. Создаём товарные позиции
        for (const item of items) {
            const amountWithoutTax = item.quantity * item.price;
            const taxAmount = amountWithoutTax * item.taxRate / 100;
            const amountWithTax = amountWithoutTax + taxAmount;

            const createdItem = await pb.collection("warehouse_receipt_items").create(
                {
                    receipt: receipt.id,
                    nomenclature: item.nomenclatureId,
                    productCode: item.code,
                    productName: item.name,
                    unit: item.unit,

                    quantity: item.quantity,
                    unitPrice: item.price,

                    amountWithoutTax,
                    taxRate: item.taxRate,
                    taxAmount,
                    amountWithTax,
                },
                {
                    requestKey: null,
                }
            );
            console.log("Создана товарная строка:", {
                itemId: createdItem.id,
                expectedReceiptId: receipt.id,
                savedReceiptId: createdItem.receipt,
            });

            if (createdItem.receipt !== receipt.id) {
                throw new Error(
                    `Не сохранилась связь товарной строки с накладной ${receipt.id}`
                );
            }

            createdItemIds.push(createdItem.id);
        }

        return receipt;

    } catch (error) {
        // 3. Если создание товара завершилось ошибкой,
        // удаляем уже созданные товарные строки и шапку накладной.
        const rollbackErrors: unknown[] = [];

        for (const id of createdItemIds) {
            try {
                await pb.collection("warehouse_receipt_items").delete(
                    id,
                    { requestKey: null }
                );
            } catch (rollbackError) {
                rollbackErrors.push(rollbackError);
            }
        }

        try {
            await pb.collection("warehouse_receipts").delete(
                receipt.id,
                { requestKey: null }
            );
        } catch (rollbackError) {
            rollbackErrors.push(rollbackError);
        }

        if (rollbackErrors.length > 0) {
            throw new Error(
                "Не удалось полностью отменить сохранение накладной. Проверьте записи в PocketBase."
            );
        }

        throw error;
    }
};

export const deleteWarehouseReceipt = async (id: string) => {
    await pb.collection("warehouse_receipts").delete(id);
};