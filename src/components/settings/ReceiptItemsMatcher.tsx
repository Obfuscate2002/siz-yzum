import { useMemo, useState } from "react";
import PocketBase from "pocketbase";
import { Alert, Button, Card, Space, Table, Tag, Typography, Upload, message } from "antd";
import type { UploadFile } from "antd";
import { UploadOutlined, LinkOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

type Receipt = {
    id: string;
    documentNumber: string;
    receiptDate?: string;
};
type ReceiptItem = {
    id: string;
    receipt?: string;
    productCode?: string;
    productName?: string;
    quantity?: number;
    unitPrice?: number;
    amountWithTax?: number;
};

type MatchRow = {
    key: string;
    document: string;
    receiptId: string;
    itemId?: string;
    productCode: string;
    productName: string;
    quantity: number;
    status: "Однозначно" | "Неоднозначно" | "Не найдено" | "Нет накладной";
    candidates: string[];
};

const norm = (v: unknown) =>
    String(v ?? "").trim().toLocaleLowerCase("ru-RU").replace(/ё/g, "е").replace(/\s+/g, " ");

const num = (v: unknown) => {
    if (typeof v === "number") return v;
    const parsed = Number(String(v ?? "").replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : NaN;
};

const cell = (row: Record<string, unknown>, startsWith: string) => {
    const key = Object.keys(row).find((k) => norm(k).startsWith(norm(startsWith)));
    return key ? row[key] : undefined;
};

interface Props {
    pb: PocketBase;
}

/**
 * Компонент сверяет Excel с warehouse_receipts и warehouse_receipt_items.
 * Автоматически обновляет ТОЛЬКО поле receipt и только для однозначных совпадений.
 * Перед записью показывает предпросмотр. Неоднозначные строки не изменяются.
 */
export function ReceiptItemsMatcher({ pb }: Props) {
    const [rows, setRows] = useState<MatchRow[]>([]);
    const [busy, setBusy] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const stats = useMemo(() => ({
        total: rows.length,
        unique: rows.filter((r) => r.status === "Однозначно").length,
        ambiguous: rows.filter((r) => r.status === "Неоднозначно").length,
        missing: rows.filter((r) => r.status === "Не найдено").length,
        noReceipt: rows.filter((r) => r.status === "Нет накладной").length,
    }), [rows]);

    const makePreview = async (file: File) => {
        setBusy(true);
        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const excelRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

            const receipts = await pb.collection("warehouse_receipts").getFullList<Receipt>({
                fields: "id,documentNumber,receiptDate",
            });
            const items = await pb.collection("warehouse_receipt_items").getFullList<ReceiptItem>({
                fields: "id,receipt,productCode,productName,quantity,unitPrice,amountWithTax",
            });

            const receiptMap = new Map(receipts.map((r) => [norm(r.documentNumber), r]));
            const freeItems = items.filter((item) => !item.receipt);
            const used = new Set<string>();
            let currentDocument = "";
            const result: MatchRow[] = [];

            excelRows.forEach((excel, index) => {
                const rawDoc = cell(excel, "Документ прихода");
                if (String(rawDoc ?? "").trim()) currentDocument = String(rawDoc).trim();
                const receipt = receiptMap.get(norm(currentDocument));

                const code = String(cell(excel, "Код товара") ?? "").trim();
                const name = String(cell(excel, "Наименование товара") ?? "").trim();
                const quantity = num(cell(excel, "Количество"));
                const unitPrice = num(cell(excel, "Цена"));
                const amountKey = Object.keys(excel).find((k) => norm(k).includes("с налогом"));
                const amount = amountKey ? num(excel[amountKey]) : NaN;

                if (!currentDocument && !name) return;

                const candidates = freeItems.filter((item) => {
                    if (used.has(item.id)) return false;
                    const sameCode = norm(item.productCode) === norm(code);
                    const sameName = norm(item.productName) === norm(name);
                    const sameQty = Number(item.quantity ?? 0) === quantity;
                    const samePrice = !Number.isFinite(unitPrice) ||
                        Math.abs(Number(item.unitPrice ?? 0) - unitPrice) < 0.02;
                    const sameAmount = !Number.isFinite(amount) ||
                        Math.abs(Number(item.amountWithTax ?? 0) - amount) < 0.03;
                    return sameCode && sameName && sameQty && samePrice && sameAmount;
                });

                let status: MatchRow["status"] = "Не найдено";
                let itemId: string | undefined;
                if (!receipt) status = "Нет накладной";
                else if (candidates.length === 1) {
                    status = "Однозначно";
                    itemId = candidates[0].id;
                    used.add(itemId);
                } else if (candidates.length > 1) status = "Неоднозначно";

                result.push({
                    key: `${index + 2}`,
                    document: currentDocument,
                    receiptId: receipt?.id ?? "",
                    itemId,
                    productCode: code,
                    productName: name,
                    quantity,
                    status,
                    candidates: candidates.map((x) => x.id),
                });
            });

            setRows(result);
            message.success(`Сверка завершена: ${result.length} строк`);
        } catch (error) {
            console.error(error);
            message.error("Не удалось прочитать Excel или загрузить записи PocketBase");
        } finally {
            setBusy(false);
        }
    };

    const applyMatches = async () => {
        const matches = rows.filter((r) => r.status === "Однозначно" && r.itemId && r.receiptId);
        if (!matches.length) {
            message.warning("Нет однозначных совпадений для обновления");
            return;
        }
        setBusy(true);
        let success = 0;
        const errors: string[] = [];
        try {
            for (const match of matches) {
                try {
                    // Изменяем исключительно relation-поле receipt.
                    await pb.collection("warehouse_receipt_items").update(match.itemId!, {
                        receipt: match.receiptId,
                    });
                    success++;
                } catch (e) {
                    errors.push(match.itemId!);
                    console.error("Не удалось обновить позицию", match.itemId, e);
                }
            }
            message.success(`Связано позиций: ${success}`);
            if (errors.length) message.warning(`Ошибок обновления: ${errors.length}`);
            setRows((prev) => prev.map((r) =>
                r.status === "Однозначно" && r.itemId
                    ? { ...r, status: "Однозначно" }
                    : r
            ));
        } finally {
            setBusy(false);
        }
    };

    const columns = [
        { title: "Документ", dataIndex: "document", width: 120 },
        { title: "Код", dataIndex: "productCode", width: 100 },
        { title: "Товар", dataIndex: "productName", ellipsis: true },
        { title: "Кол-во", dataIndex: "quantity", width: 80 },
        {
            title: "Статус",
            dataIndex: "status",
            width: 150,
            render: (status: MatchRow["status"]) => (
                <Tag color={status === "Однозначно" ? "green" : status === "Неоднозначно" ? "orange" : "red"}>
                    {status}
                </Tag>
            ),
        },
        {
            title: "ID позиции",
            dataIndex: "itemId",
            width: 180,
            render: (id?: string, record?: MatchRow) => id || record?.candidates.join(", ") || "—",
        },
    ];

    return (
        <Card title="Сопоставление товарных позиций с накладными">
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <Alert
                    type="info"
                    showIcon
                    message="Безопасный режим"
                    description="Сначала загрузите Excel и проверьте предварительное сопоставление. Запись изменяет только поле receipt и только для однозначных совпадений. Неоднозначные и ненайденные строки пропускаются."
                />
                <Upload
                    accept=".xlsx,.xls"
                    maxCount={1}
                    fileList={fileList}
                    beforeUpload={(file) => {
                        setFileList([file]);
                        void makePreview(file);
                        return false;
                    }}
                    onRemove={() => {
                        setFileList([]);
                        setRows([]);
                        return true;
                    }}
                >
                    <Button icon={<UploadOutlined />} loading={busy}>Выбрать Excel-файл</Button>
                </Upload>

                {rows.length > 0 && (
                    <>
                        <Space wrap>
                            <Typography.Text>Строк: <b>{stats.total}</b></Typography.Text>
                            <Tag color="green">Однозначно: {stats.unique}</Tag>
                            <Tag color="orange">Неоднозначно: {stats.ambiguous}</Tag>
                            <Tag color="red">Не найдено: {stats.missing}</Tag>
                            <Tag>Нет накладной: {stats.noReceipt}</Tag>
                        </Space>
                        <Table
                            size="small"
                            rowKey="key"
                            columns={columns}
                            dataSource={rows}
                            pagination={{ pageSize: 20 }}
                            scroll={{ x: 1000 }}
                        />
                        <Button
                            type="primary"
                            icon={<LinkOutlined />}
                            loading={busy}
                            disabled={stats.unique === 0}
                            onClick={() => void applyMatches()}
                        >
                            Привязать {stats.unique} однозначных позиций
                        </Button>
                    </>
                )}
            </Space>
        </Card>
    );
}
