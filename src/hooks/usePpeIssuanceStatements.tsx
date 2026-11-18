
import { pb } from "../pocketbase/pocketbase.ts";

import type { PpeIssuanceStatement } from "../types/PpeIssuanceStatement.ts";
import type { PpeIssuanceStatementItem } from "../types/PpeIssuanceStatementItem.ts";

// Получение всех ведомостей
export const getPpeIssuanceStatements =
    async (): Promise<PpeIssuanceStatement[]> => {
        const data = await pb
            .collection("ppe_issuance_statements")
            .getFullList<PpeIssuanceStatement>({
                expand:
                    "division, responsibleEmployee, employee, employee.positionRelation, employee.contractPosition",
                requestKey: null,
            });

        return data;
    };

// Получение всех позиций ведомостей
export const getPpeIssuanceStatementItems =
    async (): Promise<PpeIssuanceStatementItem[]> => {
        const data = await pb
            .collection("ppe_issuance_statement_items")
            .getFullList<PpeIssuanceStatementItem>({
                expand:
                    "statement, employee, warehouse_nomenclature, contractPosition",
                requestKey: null,
            });

        return data;
    };

// Создание ведомости
export const createPpeIssuanceStatement = async (
    data: Omit<PpeIssuanceStatement, "id" | "created" | "updated">
): Promise<PpeIssuanceStatement> => {
    try {
        console.log(
            "Данные для создания ведомости:",
            JSON.stringify(data, null, 2)
        );

        const record = await pb
            .collection("ppe_issuance_statements")
            .create<PpeIssuanceStatement>(data, {
                requestKey: null,
            });

        console.log("Ведомость успешно создана:", record);

        return record;
    } catch (error: any) {
        console.error("Ошибка создания ведомости:");
        console.error("Статус:", error?.status);
        console.error("Сообщение:", error?.message);
        console.error(
            "Подробности PocketBase:",
            JSON.stringify(error?.data, null, 2)
        );

        throw error;
    }
};

// Создание одной позиции ведомости
export const createPpeIssuanceStatementItem = async (
    data: Omit<
        PpeIssuanceStatementItem,
        "id" | "created" | "updated" | "expand"
    >
): Promise<PpeIssuanceStatementItem> => {
    try {
        console.log(
            "Значение wearPeriodUnit:",
            JSON.stringify(data.wearPeriodUnit)
        );

        console.log(
            "Отправляем строку СИЗ в PocketBase:",
            JSON.stringify(data, null, 2)
        );

        const record = await pb
            .collection("ppe_issuance_statement_items")
            .create<PpeIssuanceStatementItem>(data, {
                requestKey: null,
            });

        console.log("Строка СИЗ успешно создана:", record);

        return record;
    } catch (error: any) {
        console.error("Ошибка создания строки СИЗ:");
        console.error("Статус:", error?.status);
        console.error("Сообщение:", error?.message);
        console.error(
            "Подробности PocketBase:",
            JSON.stringify(error?.data, null, 2)
        );

        throw error;
    }
};

// Последовательное создание нескольких позиций ведомости
export const createPpeIssuanceStatementItems = async (
    items: Array<
        Omit<
            PpeIssuanceStatementItem,
            "id" | "created" | "updated" | "expand"
        >
    >
): Promise<PpeIssuanceStatementItem[]> => {
    const records: PpeIssuanceStatementItem[] = [];

    for (let i = 0; i < items.length; i++) {
        const currentItem = items[i];

        console.log(
            `Сохранение строки ${i + 1} из ${items.length}`
        );

        console.log(
            "Проверка данных строки:",
            JSON.stringify(currentItem, null, 2)
        );

        try {
            const record =
                await createPpeIssuanceStatementItem(currentItem);

            records.push(record);
        } catch (error: any) {
            console.error(
                `Не удалось сохранить строку №${i + 1}:`,
                JSON.stringify(currentItem, null, 2)
            );

            console.error(
                "Причина ошибки:",
                JSON.stringify(error?.data, null, 2)
            );

            throw error;
        }
    }

    return records;
};
