
import { useState } from "react";
import { Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import {pb} from "../../pocketbase/pocketbase.ts";

interface ImportReceiptRow {
    counterpartyName: string;
    documentNumber: string;
    receiptDate: string | number;
    basis?: string;
    status?: string;
}

interface CounterpartyRecord {
    id: string;
    name: string;
}

interface ExistingReceipt {
    id: string;
    documentNumber: string;
    receiptDate: string;
    counterparty?: string;
}

interface Props {
    onImported?: () => void;
}

const normalize = (value: unknown) =>
    String(value ?? "").trim().toLowerCase();

const normalizeDate = (value: unknown): string => {
    if (!value) return "";

    if (typeof value === "number") {
        const date = XLSX.SSF.parse_date_code(value);
        if (!date) return "";

        return [
            date.y,
            String(date.m).padStart(2, "0"),
            String(date.d).padStart(2, "0"),
        ].join("-");
    }

    const text = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
        return text.slice(0, 10);
    }

    const parsed = new Date(text);

    if (Number.isNaN(parsed.getTime())) return "";

    return [
        parsed.getFullYear(),
        String(parsed.getMonth() + 1).padStart(2, "0"),
        String(parsed.getDate()).padStart(2, "0"),
    ].join("-");
};

export const ImportWarehouseReceiptsButton = ({
                                                  onImported,
                                              }: Props) => {
    const [loading, setLoading] = useState(false);

    const handleImport = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setLoading(true);

        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });

            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            const rows = XLSX.utils.sheet_to_json<ImportReceiptRow>(sheet, {
                defval: "",
            });

            if (!rows.length) {
                message.warning("В Excel нет данных для импорта");
                return;
            }

            // Загружаем справочник контрагентов
            const counterparties =
                await pb.collection("counterparty_directory").getFullList<CounterpartyRecord>();

            // Загружаем существующие накладные
            const existingReceipts =
                await pb.collection("warehouse_receipts").getFullList<ExistingReceipt>();

            const counterpartyMap = new Map(
                counterparties.map((item) => [
                    normalize(item.name),
                    item.id,
                ])
            );

            let created = 0;
            let restored = 0;
            let skipped = 0;

            for (const row of rows) {
                const counterpartyId = counterpartyMap.get(
                    normalize(row.counterpartyName)
                );

                if (!counterpartyId) {
                    console.warn(
                        "Контрагент не найден:",
                        row.counterpartyName
                    );
                    skipped++;
                    continue;
                }

                const documentNumber = String(row.documentNumber).trim();
                const receiptDate = normalizeDate(row.receiptDate);

                if (!documentNumber || !receiptDate) {
                    skipped++;
                    continue;
                }

                // Ищем существующую накладную по номеру и дате
                const matches = existingReceipts.filter(
                    (receipt) =>
                        normalize(receipt.documentNumber) ===
                        normalize(documentNumber) &&
                        normalizeDate(receipt.receiptDate) === receiptDate
                );

                if (matches.length > 1) {
                    console.warn("Найдено несколько накладных:", documentNumber);
                    skipped++;
                    continue;
                }

                const payload = {
                    counterparty: counterpartyId,
                    documentNumber,
                    receiptDate: `${receiptDate} 00:00:00.000Z`,
                    basis: row.basis || "",
                    status: row.status || "completed",
                };

                if (matches.length === 1) {
                    // Восстанавливаем связь у существующей накладной
                    await pb.collection("warehouse_receipts").update(
                        matches[0].id,
                        { counterparty: counterpartyId }
                    );

                    restored++;
                } else {
                    // Создаём новую накладную
                    await pb.collection("warehouse_receipts").create(payload);
                    created++;
                }
            }

            message.success(
                `Импорт завершён. Восстановлено: ${restored}, создано: ${created}, пропущено: ${skipped}`
            );

            onImported?.();
        } catch (error) {
            console.error("Ошибка импорта:", error);
            message.error("Ошибка импорта. Подробности в консоли браузера.");
        } finally {
            setLoading(false);
            event.target.value = "";
        }
    };

    return (
        <label>
            <input
                type="file"
                accept=".xlsx,.xls"
                hidden
                onChange={handleImport}
                disabled={loading}
            />

            <Button
                icon={<UploadOutlined />}
                loading={loading}
                disabled={loading}
                onClick={(event) => {
                    const input = event.currentTarget
                        .parentElement?.querySelector("input");

                    input?.click();
                }}
            >
                Импорт приходных накладных
            </Button>
        </label>
    );
};
