
import { pb } from "../pocketbase/pocketbase.ts";

import type { PpeIssuanceStatement } from "../types/PpeIssuanceStatement.ts";
import type { PpeIssuanceStatementItem } from "../types/PpeIssuanceStatementItem.ts";

// Получение всех ведомостей
export const getPpeIssuanceStatements = async (): Promise<PpeIssuanceStatement[]> => {
    const data = await pb
        .collection("ppe_issuance_statements")
        .getFullList<PpeIssuanceStatement>({
            expand: "division, responsibleEmployee",
            requestKey: null,
        });

    return data;
};

// Получение всех позиций ведомостей
export const getPpeIssuanceStatementItems = async (): Promise<PpeIssuanceStatementItem[]> => {
    const data = await pb
        .collection("ppe_issuance_statement_items")
        .getFullList<PpeIssuanceStatementItem>({
            expand: "statement, employee, warehouse_nomenclature, contractPosition",
            requestKey: null,
        });

    return data;
};

// Создание ведомости
export const createPpeIssuanceStatement = async (
    data: Omit<PpeIssuanceStatement, "id" | "created" | "updated">
): Promise<PpeIssuanceStatement> => {
    const record = await pb
        .collection("ppe_issuance_statements")
        .create<PpeIssuanceStatement>(data, {
            requestKey: null,
        });

    return record;
};

// Создание одной позиции ведомости
export const createPpeIssuanceStatementItem = async (
    data: Omit<
        PpeIssuanceStatementItem,
        "id" | "created" | "updated" | "expand"
    >
): Promise<PpeIssuanceStatementItem> => {
    try {
        const record = await pb
            .collection("ppe_issuance_statement_items")
            .create<PpeIssuanceStatementItem>(data, {
                requestKey: null,
            });

        return record;
    } catch (error: any) {
        console.error(
            "Ошибка создания строки ведомости:",
            error?.data ?? error
        );

        throw error;
    }
};

// Создание нескольких позиций ведомости
export const createPpeIssuanceStatementItems = async (
    items: Array<
        Omit<
            PpeIssuanceStatementItem,
            "id" | "created" | "updated" | "expand"
        >
    >
): Promise<PpeIssuanceStatementItem[]> => {
    const records: PpeIssuanceStatementItem[] = [];

    for (const item of items) {
        const record = await createPpeIssuanceStatementItem(item);
        records.push(record);
    }

    return records;
};
