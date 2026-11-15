
import { useState } from "react";
import {
    Alert,
    Button,
    Card,
    Col,
    message,
    Row,
    Space,
    Statistic,
    Table,
    Typography,
    Upload,
} from "antd";
import { LinkOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import * as XLSX from "xlsx";
import PocketBase from "pocketbase";

const { Text } = Typography;

type Props = {
    pb: PocketBase;
};

type Receipt = {
    id: string;
    documentNumber: string;
    receiptDate: string;
    counterparty: string;
    expand?: {
        counterparty?: {
            id: string;
            name: string;
        };
    };
};

type ReceiptItem = {
    id: string;
    receipt: string;
    productCode: string;
    productName: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    amountWithoutTax: number;
    taxRate: number;
    taxAmount: number;
    amountWithTax: number;
};

type ExcelItem = {
    rowNumber: number;
    counterpartyName: string;
    documentNumber: string;
    receiptDate: string;
    productCode: string;
    productName: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    amountWithoutTax: number;
    taxRate: number;
    taxAmount: number;
    amountWithTax: number;
};

type MatchResult = {
    rowNumber: number;
    documentNumber: string;
    productName: string;
    itemId?: string;
    receiptId?: string;
    status: "matched" | "not_found" | "ambiguous";
    reason?: string;
};

const normalizeText = (value: unknown): string =>
    String(value ?? "")
        .replace(/\u00A0/g, " ")
        .replace(/[\r\n\t]+/g, " ")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase()
        .replace(/[«»„“”]/g, '"')
        .replace(/[’‘]/g, "'");

const normalizeNumber = (value: unknown): number => {
    if (typeof value === "number") return value;

    const normalized = String(value ?? "")
        .replace(/\u00A0/g, "")
        .replace(/\s/g, "")
        .replace(",", ".")
        .replace("%", "")
        .replace(/[^\d.-]/g, "");

    return Number(normalized) || 0;
};


const dateKey = (value: unknown): string => {
    if (value instanceof Date) {
        return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
    }

    if (typeof value === "number") {
        const date = XLSX.SSF.parse_date_code(value);

        if (date) {
            return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
        }
    }

    const text = String(value ?? "").trim();

    const match = text.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/);

    if (match) {
        return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
    }

    const parsed = new Date(text);

    if (!Number.isNaN(parsed.getTime())) {
        return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
    }

    return text;
};

const findColumn = (
    headers: string[],
    variants: string[]
): number => {
    const normalizedHeaders = headers.map(normalizeText);

    for (const variant of variants) {
        const normalizedVariant = normalizeText(variant);

        const index = normalizedHeaders.findIndex(
            header => header === normalizedVariant
        );

        if (index !== -1) return index;
    }

    for (const variant of variants) {
        const normalizedVariant = normalizeText(variant);

        const index = normalizedHeaders.findIndex(
            header =>
                header.includes(normalizedVariant) ||
                normalizedVariant.includes(header) && header.length > 10
        );

        if (index !== -1) return index;
    }

    return -1;
};

const makeItemSignature = (item: {
    productCode: unknown;
    productName: unknown;
    unit: unknown;
    quantity: unknown;
    unitPrice: unknown;
    amountWithoutTax: unknown;
    taxRate: unknown;
    taxAmount: unknown;
    amountWithTax: unknown;
}) =>
    [
        normalizeText(item.productCode),
        normalizeText(item.productName),
        normalizeText(item.unit),
        normalizeNumber(item.quantity).toFixed(3),
        normalizeNumber(item.unitPrice).toFixed(2),
        normalizeNumber(item.amountWithoutTax).toFixed(2),
        normalizeNumber(item.taxRate).toFixed(2),
        normalizeNumber(item.taxAmount).toFixed(2),
        normalizeNumber(item.amountWithTax).toFixed(2),
    ].join("|");

export default function RestoreWarehouseReceiptLinksButton({
                                                               pb,
                                                           }: Props) {
    const [excelItems, setExcelItems] = useState<ExcelItem[]>([]);
    const [results, setResults] = useState<MatchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [applying, setApplying] = useState(false);
    const [fileName, setFileName] = useState("");

    const parseExcel = async (file: File) => {
        setLoading(true);
        setResults([]);
        setExcelItems([]);

        try {
            const buffer = await file.arrayBuffer();

            const workbook = XLSX.read(buffer, {
                type: "array",
                cellDates: true,
            });

            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
                header: 1,
                defval: "",
                raw: true,
            });

            if (rows.length < 2) {
                throw new Error("В Excel нет строк с данными");
            }

            const headers = (rows[0] as unknown[]).map(String);

            console.log("Заголовки Excel:", headers);

            const columns = {
                counterparty: findColumn(headers, ["Контрагент"]),

                document: findColumn(headers, [
                    "Документ прихода сч.ф.",
                    "Документ прихода",
                ]),

                date: findColumn(headers, ["Дата прихода"]),

                code: findColumn(headers, [
                    "Код товара/ работ, услуг",
                    "Код товара",
                ]),

                name: findColumn(headers, [
                    "Наименование товара (описание выполненных работ, оказанных услуг), имущественного права",
                    "Наименование товара",
                ]),

                // В исходном Excel шестая колонка без названия.
                unit: 5,

                quantity: findColumn(headers, [
                    "Количество (объем)",
                ]),

                price: findColumn(headers, [
                    "Цена (тариф) за единицу измерения",
                    "Цена (тариф) за единицу",
                ]),

                withoutTax: findColumn(headers, [
                    "Стоимость товаров (работ,услуг), имущественных прав без налога - всего",
                    "Стоимость товаров (работ, услуг), имущественных прав без налога - всего",
                ]),

                taxRate: findColumn(headers, [
                    "Налого-вая ставка",
                    "Налоговая ставка",
                ]),

                taxAmount: findColumn(headers, [
                    "Сумма налога, предъявляемая покупателю",
                ]),

                withTax: findColumn(headers, [
                    "Стоимость товаров (работ, услуг), имущественных прав с налогом - всего",
                    "Стоимость товаров (работ,услуг), имущественных прав с налогом - всего",
                ]),
            };

            const missing = Object.entries(columns)
                .filter(([key, index]) => index === -1 && key !== "counterparty")
                .map(([key]) => key);

            if (missing.length) {
                console.error("Заголовки Excel:", headers);
                console.error("Найденные индексы колонок:", columns);

                throw new Error(
                    `Не найдены колонки: ${missing.join(", ")}. Открой консоль браузера (F12) и посмотри заголовки Excel.`
                );
            }

            let currentCounterparty = "";
            let currentDocument = "";
            let currentDate: unknown = "";

            const parsed: ExcelItem[] = [];

            rows.slice(1).forEach((row, index) => {
                const value = (column: number) =>
                    column >= 0 ? row[column] : "";

                if (normalizeText(value(columns.counterparty))) {
                    currentCounterparty = String(
                        value(columns.counterparty)
                    ).trim();
                }

                if (normalizeText(value(columns.document))) {
                    currentDocument = String(
                        value(columns.document)
                    ).trim();
                }

                if (value(columns.date) !== "") {
                    currentDate = value(columns.date);
                }

                const productName = String(
                    value(columns.name) ?? ""
                ).trim();

                if (!productName || !currentDocument || !currentDate) {
                    return;
                }

                parsed.push({
                    rowNumber: index + 2,
                    counterpartyName: currentCounterparty,
                    documentNumber: currentDocument,
                    receiptDate: dateKey(currentDate),
                    productCode: String(value(columns.code) ?? "").trim(),
                    productName,
                    unit: String(value(columns.unit) ?? "").trim(),
                    quantity: normalizeNumber(value(columns.quantity)),
                    unitPrice: normalizeNumber(value(columns.price)),
                    amountWithoutTax: normalizeNumber(value(columns.withoutTax)),
                    taxRate: normalizeNumber(value(columns.taxRate)),
                    taxAmount: normalizeNumber(value(columns.taxAmount)),
                    amountWithTax: normalizeNumber(value(columns.withTax)),
                });
            });

            if (!parsed.length) {
                throw new Error("Не удалось найти товарные строки в Excel");
            }

            setExcelItems(parsed);
            setFileName(file.name);

            message.success(`Прочитано товарных строк: ${parsed.length}`);
        } catch (error) {
            message.error(
                error instanceof Error ? error.message : "Ошибка чтения Excel"
            );
        } finally {
            setLoading(false);
        }
    };

    const runPreview = async () => {
        if (!excelItems.length) {
            message.warning("Сначала выбери Excel-файл");
            return;
        }

        setLoading(true);

        try {
            const [receipts, items] = await Promise.all([
                pb.collection("warehouse_receipts").getFullList<Receipt>({
                    expand: "counterparty",
                }),

                pb.collection("warehouse_receipt_items").getFullList<ReceiptItem>(),
            ]);

            const output: MatchResult[] = [];

            // Сопоставляем товарные строки с накладными.
            for (const excel of excelItems) {
                const receiptCandidates = receipts.filter(receipt => {
                    const sameDocument =
                        normalizeText(receipt.documentNumber) ===
                        normalizeText(excel.documentNumber);

                    const sameDate =
                        dateKey(receipt.receiptDate) === excel.receiptDate;

                    const receiptCounterparty = normalizeText(
                        receipt.expand?.counterparty?.name
                    );

                    const sameCounterparty =
                        !excel.counterpartyName ||
                        receiptCounterparty === normalizeText(excel.counterpartyName);

                    return sameDocument && sameDate && sameCounterparty;
                });

                if (receiptCandidates.length !== 1) {
                    output.push({
                        rowNumber: excel.rowNumber,
                        documentNumber: excel.documentNumber,
                        productName: excel.productName,
                        status: receiptCandidates.length ? "ambiguous" : "not_found",
                        reason: receiptCandidates.length
                            ? "Найдено несколько накладных"
                            : "Накладная не найдена",
                    });

                    continue;
                }

                const receipt = receiptCandidates[0];

                const itemCandidates = items.filter(item => {
                    return (
                        makeItemSignature(item) === makeItemSignature(excel) &&
                        (!item.receipt || item.receipt === receipt.id)
                    );
                });

                if (itemCandidates.length !== 1) {
                    output.push({
                        rowNumber: excel.rowNumber,
                        documentNumber: excel.documentNumber,
                        productName: excel.productName,
                        receiptId: receipt.id,
                        status: itemCandidates.length ? "ambiguous" : "not_found",
                        reason: itemCandidates.length
                            ? "Несколько одинаковых товарных строк"
                            : "Товарная строка не найдена",
                    });

                    continue;
                }

                const item = itemCandidates[0];

                output.push({
                    rowNumber: excel.rowNumber,
                    documentNumber: excel.documentNumber,
                    productName: excel.productName,
                    itemId: item.id,
                    receiptId: receipt.id,
                    status: "matched",
                    reason: item.receipt === receipt.id
                        ? "Связь уже установлена"
                        : undefined,
                });
            }

            // Запрещаем повторно сопоставлять одну запись.
            const usedItemIds = new Set<string>();

            const safeOutput = output.map(result => {
                if (result.status !== "matched" || !result.itemId) {
                    return result;
                }

                if (usedItemIds.has(result.itemId)) {
                    return {
                        ...result,
                        status: "ambiguous" as const,
                        reason: "Запись уже сопоставлена другой строке Excel",
                    };
                }

                usedItemIds.add(result.itemId);
                return result;
            });

            setResults(safeOutput);

            const matched = safeOutput.filter(
                result => result.status === "matched"
            ).length;

            const ambiguous = safeOutput.filter(
                result => result.status === "ambiguous"
            ).length;

            const notFound = safeOutput.filter(
                result => result.status === "not_found"
            ).length;

            message.success(
                `Проверка завершена. Совпадений: ${matched}, неоднозначных: ${ambiguous}, не найдено: ${notFound}`
            );
        } catch (error) {
            message.error(
                error instanceof Error ? error.message : "Ошибка проверки"
            );
        } finally {
            setLoading(false);
        }
    };

    const applyChanges = async () => {
        const toUpdate = results.filter(
            result =>
                result.status === "matched" &&
                result.itemId &&
                result.receiptId &&
                result.reason !== "Связь уже установлена"
        );

        if (!toUpdate.length) {
            message.info("Нет связей для восстановления");
            return;
        }

        setApplying(true);

        let updated = 0;
        const errors: string[] = [];

        try {
            for (const result of toUpdate) {
                try {
                    await pb.collection("warehouse_receipt_items").update(
                        result.itemId!,
                        {
                            receipt: result.receiptId!,
                        },
                        {
                            requestKey: null,
                        }
                    );

                    updated++;
                } catch (error) {
                    errors.push(
                        `Строка Excel ${result.rowNumber}: ${
                            error instanceof Error ? error.message : "Ошибка обновления"
                        }`
                    );
                }
            }

            message.success(`Восстановлено связей: ${updated}`);

            if (errors.length) {
                console.error("Ошибки обновления:", errors);
                message.warning(`Не удалось обновить записей: ${errors.length}`);
            }

            await runPreview();
        } finally {
            setApplying(false);
        }
    };

    const matched = results.filter(
        result => result.status === "matched"
    ).length;

    const ambiguous = results.filter(
        result => result.status === "ambiguous"
    ).length;

    const notFound = results.filter(
        result => result.status === "not_found"
    ).length;

    const pending = results.some(
        result =>
            result.status === "matched" &&
            result.reason !== "Связь уже установлена"
    );

    const uploadProps: UploadProps = {
        accept: ".xlsx,.xls",
        maxCount: 1,
        showUploadList: true,

        beforeUpload: file => {
            void parseExcel(file);
            return false;
        },

        onRemove: () => {
            setExcelItems([]);
            setResults([]);
            setFileName("");
            return true;
        },
    };

    return (
        <Card title="Восстановление связей товарных строк с накладными">
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <Alert
                    type="info"
                    showIcon
                    message="Безопасный режим"
                    description="Сначала выполняется проверка без изменений в базе. Записи с неоднозначными совпадениями автоматически пропускаются."
                />

                <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />} loading={loading}>
                        Выбрать Excel-файл
                    </Button>
                </Upload>

                {fileName && (
                    <Text type="secondary">Файл: {fileName}</Text>
                )}

                {excelItems.length > 0 && (
                    <Alert
                        type="success"
                        message={`Excel прочитан: ${excelItems.length} товарных строк`}
                    />
                )}

                <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    onClick={runPreview}
                    disabled={!excelItems.length}
                    loading={loading}
                >
                    Проверить совпадения
                </Button>

                {results.length > 0 && (
                    <>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Statistic title="Совпадения" value={matched} />
                            </Col>

                            <Col span={8}>
                                <Statistic
                                    title="Неоднозначные"
                                    value={ambiguous}
                                    valueStyle={{ color: "#d48806" }}
                                />
                            </Col>

                            <Col span={8}>
                                <Statistic
                                    title="Не найдены"
                                    value={notFound}
                                    valueStyle={{ color: "#cf1322" }}
                                />
                            </Col>
                        </Row>

                        <Table
                            size="small"
                            rowKey="rowNumber"
                            pagination={{ pageSize: 10 }}
                            dataSource={results}
                            columns={[
                                {
                                    title: "Строка Excel",
                                    dataIndex: "rowNumber",
                                    width: 110,
                                },
                                {
                                    title: "Номер накладной",
                                    dataIndex: "documentNumber",
                                },
                                {
                                    title: "Товар",
                                    dataIndex: "productName",
                                },
                                {
                                    title: "Результат",
                                    dataIndex: "status",
                                    render: (status: MatchResult["status"]) => {
                                        if (status === "matched") {
                                            return <Text type="success">Совпадение</Text>;
                                        }

                                        if (status === "ambiguous") {
                                            return <Text type="warning">Неоднозначно</Text>;
                                        }

                                        return <Text type="danger">Не найдено</Text>;
                                    },
                                },
                                {
                                    title: "Комментарий",
                                    dataIndex: "reason",
                                },
                            ]}
                        />

                        <Alert
                            type="warning"
                            showIcon
                            message="Проверь результат перед записью"
                            description="Будет изменено только поле receipt у однозначно сопоставленных записей. Остальные поля товаров не меняются."
                        />

                        <Button
                            type="primary"
                            danger
                            block
                            disabled={!pending || ambiguous > 0 || notFound > 0}
                            loading={applying}
                            onClick={applyChanges}
                        >
                            Восстановить связи в PocketBase
                        </Button>

                        {(ambiguous > 0 || notFound > 0) && (
                            <Text type="secondary">
                                Запись заблокирована: есть неоднозначные или ненайденные строки.
                            </Text>
                        )}
                    </>
                )}
            </Space>
        </Card>
    );
}
