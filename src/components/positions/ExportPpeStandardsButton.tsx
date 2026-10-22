
import { useState } from "react";
import PocketBase from "pocketbase";
import { Button, message } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

type Props = {
    pb: PocketBase;
};

type Position = {
    id: string;
    name?: string;
};

type PpeStandard = Record<string, unknown> & {
    id: string;
    expand?: {
        position?: Position | Position[];
    };
};

const toExcelValue = (value: unknown): string | number | boolean => {
    if (value == null) return "";

    if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        return value;
    }

    return JSON.stringify(value);
};

export function ExportPpeStandardsButton({ pb }: Props) {
    const [loading, setLoading] = useState(false);

    const exportToExcel = async () => {
        setLoading(true);

        try {
            // Загружаем все записи коллекции, а не только первую страницу.
            const records = await pb
                .collection("ppe_issuance_standards")
                .getFullList<PpeStandard>({
                    sort: "created",
                    expand: "position",
                });

            if (records.length === 0) {
                message.info("Коллекция не содержит записей");
                return;
            }

            // Собираем все поля, которые присутствуют в выгруженных записях.
            const fieldSet = new Set<string>();

            records.forEach((record) => {
                Object.keys(record).forEach((field) => {
                    if (field !== "expand") {
                        fieldSet.add(field);
                    }
                });
            });

            const fields = Array.from(fieldSet);

            // Подготавливаем строки Excel и добавляем название связанной должности.
            const rows = records.map((record) => {
                const row: Record<string, string | number | boolean> = {};

                fields.forEach((field) => {
                    row[field] = toExcelValue(record[field]);
                });

                const expandedPosition = record.expand?.position;
                const position = Array.isArray(expandedPosition)
                    ? expandedPosition[0]
                    : expandedPosition;

                row["position_name_expanded"] = position?.name ?? "";

                return row;
            });

            const worksheet = XLSX.utils.json_to_sheet(rows);

            // Автоматическая ширина столбцов.
            const headers = Object.keys(rows[0]);

            worksheet["!cols"] = headers.map((header) => {
                const maxLength = Math.max(
                    header.length,
                    ...rows.slice(0, 200).map((row) =>
                        String(row[header] ?? "").length
                    )
                );

                return { wch: Math.min(Math.max(maxLength + 2, 12), 45) };
            });

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Все записи");

            // Дополнительный лист со сводкой экспорта.
            const infoSheet = XLSX.utils.aoa_to_sheet([
                ["Параметр", "Значение"],
                ["Коллекция", "ppe_issuance_standards"],
                ["Количество записей", records.length],
                ["Дата экспорта", new Date().toLocaleString("ru-RU")],
            ]);

            XLSX.utils.book_append_sheet(workbook, infoSheet, "Информация");

            const date = new Date().toISOString().slice(0, 10);

            XLSX.writeFile(
                workbook,
                `ppe_issuance_standards_${date}.xlsx`
            );

            message.success(`Экспортировано записей: ${records.length}`);
        } catch (error) {
            console.error("Ошибка экспорта:", error);

            message.error(
                error instanceof Error
                    ? `Ошибка экспорта: ${error.message}`
                    : "Не удалось экспортировать коллекцию"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            icon={<FileExcelOutlined />}
            onClick={exportToExcel}
            loading={loading}
        >
            Экспорт всей коллекции в Excel
        </Button>
    );
}
