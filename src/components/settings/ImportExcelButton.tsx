import { useRef, useState, type ChangeEvent } from 'react';
import { Button, message } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import {pb} from "../../pocketbase/pocketbase.ts";


const RECEIPTS_COLLECTION = 'warehouse_receipts';
const ITEMS_COLLECTION = 'warehouse_receipt_items';

interface ReceiptItem {
    productCode: string;
    productName: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    amountWithoutTax: number;
    taxRate: number;
    taxAmount: number;
    amountWithTax: number;
}

interface ReceiptGroup {
    documentNumber: string;
    receiptDate: string;
    counterparty: string;
    items: ReceiptItem[];
}

// Преобразование значения Excel в строку
const toText = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    return String(value).trim();
};

// Преобразование чисел из Excel
const toNumber = (value: unknown): number => {
    if (value === null || value === undefined || value === '') return 0;

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }

    const normalized = String(value)
        .replace(/\s/g, '')
        .replace(',', '.');

    const result = Number(normalized);
    return Number.isFinite(result) ? result : 0;
};

// Преобразование даты Excel в формат PocketBase
const parseExcelDate = (value: unknown): string => {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString();
    }

    // Excel хранит даты в виде чисел
    if (typeof value === 'number') {
        const parsed = XLSX.SSF.parse_date_code(value);

        if (parsed) {
            const date = new Date(
                Date.UTC(parsed.y, parsed.m - 1, parsed.d)
            );

            return date.toISOString();
        }
    }

    const text = toText(value);

    if (!text) {
        throw new Error('Не указана дата накладной');
    }

    // Формат ДД.ММ.ГГГГ
    const ruDate = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);

    if (ruDate) {
        const [, day, month, year] = ruDate;

        return new Date(
            Date.UTC(Number(year), Number(month) - 1, Number(day))
        ).toISOString();
    }

    const date = new Date(text);

    if (Number.isNaN(date.getTime())) {
        throw new Error(`Не удалось распознать дату: ${text}`);
    }

    return date.toISOString();
};

// Экранирование номера документа для фильтра PocketBase
const escapeFilterValue = (value: string): string => {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
};

const ImportExcelButton = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);

    const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        try {
            setLoading(true);

            // Проверяем авторизацию
            if (!pb.authStore.isValid) {
                message.error(
                    'Нет авторизации PocketBase. Сначала войдите в приложение.'
                );
                return;
            }

            // Читаем Excel
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, {
                type: 'array',
                cellDates: true,
            });

            const sheetName = workbook.SheetNames[0];

            if (!sheetName) {
                message.error('В Excel-файле не найден лист.');
                return;
            }

            const worksheet = workbook.Sheets[sheetName];

            const rows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: null,
                raw: true,
            });

            if (rows.length < 2) {
                message.error('В Excel-файле нет строк для импорта.');
                return;
            }

            // Группируем строки товаров по накладным
            const groups = new Map<string, ReceiptGroup>();

            let currentDocumentNumber = '';
            let currentCounterparty = '';
            let currentReceiptDate = '';

            // Первая строка — заголовки таблицы
            for (const row of rows.slice(1)) {
                const counterpartyFromRow = toText(row[0]);
                const documentNumberFromRow = toText(row[1]);
                const receiptDateFromRow = row[2];

                if (counterpartyFromRow) {
                    currentCounterparty = counterpartyFromRow;
                }

                // Новая накладная начинается со строки, где указан номер документа
                if (documentNumberFromRow) {
                    currentDocumentNumber = documentNumberFromRow;
                }

                if (receiptDateFromRow !== null && receiptDateFromRow !== undefined) {
                    currentReceiptDate = parseExcelDate(receiptDateFromRow);
                }

                // Пропускаем строки без номера накладной
                if (!currentDocumentNumber) continue;

                let group = groups.get(currentDocumentNumber);

                if (!group) {
                    if (!currentReceiptDate) {
                        throw new Error(
                            `Для накладной ${currentDocumentNumber} не указана дата`
                        );
                    }

                    group = {
                        documentNumber: currentDocumentNumber,
                        receiptDate: currentReceiptDate,
                        counterparty: currentCounterparty,
                        items: [],
                    };

                    groups.set(currentDocumentNumber, group);
                }

                // Обновляем контрагента, если он встретился в последующих строках
                if (currentCounterparty) {
                    group.counterparty = currentCounterparty;
                }

                // Данные товарной строки
                const productCode = toText(row[3]);
                const productName = toText(row[4]);

                // Пустые строки товаров пропускаем
                if (!productCode && !productName) continue;

                group.items.push({
                    productCode,
                    productName,
                    unit: toText(row[5]),
                    quantity: toNumber(row[6]),
                    unitPrice: toNumber(row[7]),
                    amountWithoutTax: toNumber(row[8]),
                    taxRate: toNumber(row[9]),
                    taxAmount: toNumber(row[10]),
                    amountWithTax: toNumber(row[11]),
                });
            }

            if (groups.size === 0) {
                message.error('Не удалось найти накладные в Excel-файле.');
                return;
            }

            let updatedReceipts = 0;
            let createdReceipts = 0;
            let createdItems = 0;

            const errors: string[] = [];

            // Импортируем накладные
            for (const group of groups.values()) {
                try {
                    if (!group.counterparty) {
                        throw new Error(
                            `Не указан контрагент для накладной ${group.documentNumber}`
                        );
                    }

                    const filterValue = escapeFilterValue(group.documentNumber);

                    // Ищем существующую накладную
                    let existingReceipt: { id: string } | null = null;

                    try {
                        existingReceipt = await pb
                            .collection(RECEIPTS_COLLECTION)
                            .getFirstListItem<{ id: string }>(
                                `documentNumber = "${filterValue}"`
                            );
                    } catch (error: unknown) {
                        const status =
                            typeof error === 'object' &&
                            error !== null &&
                            'status' in error
                                ? (error as { status?: number }).status
                                : undefined;

                        // 404 означает, что накладная не найдена.
                        // Остальные ошибки нельзя считать отсутствием записи.
                        if (status !== 404) {
                            throw error;
                        }
                    }

                    // Если накладная существует — обновляем только контрагента
                    if (existingReceipt) {
                        await pb
                            .collection(RECEIPTS_COLLECTION)
                            .update(existingReceipt.id, {
                                counterparty: group.counterparty,
                            });

                        updatedReceipts++;

                        // Товары не создаём повторно
                        continue;
                    }

                    // Если накладной нет — создаём новую
                    const newReceipt = await pb
                        .collection(RECEIPTS_COLLECTION)
                        .create({
                            documentNumber: group.documentNumber,
                            receiptDate: group.receiptDate,
                            counterparty: group.counterparty,
                            basis: '',
                            status: 'completed',
                        });

                    createdReceipts++;

                    // Создаём товарные строки новой накладной
                    for (const item of group.items) {
                        await pb.collection(ITEMS_COLLECTION).create({
                            receipt: newReceipt.id,
                            productCode: item.productCode,
                            productName: item.productName,
                            unit: item.unit,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            amountWithoutTax: item.amountWithoutTax,
                            taxRate: item.taxRate,
                            taxAmount: item.taxAmount,
                            amountWithTax: item.amountWithTax,
                        });

                        createdItems++;
                    }
                } catch (error: unknown) {
                    console.error(
                        `Ошибка импорта накладной ${group.documentNumber}:`,
                        error
                    );

                    const errorMessage =
                        error instanceof Error ? error.message : String(error);

                    errors.push(
                        `${group.documentNumber}: ${errorMessage}`
                    );
                }
            }

            // Итог импорта
            if (errors.length === 0) {
                message.success(
                    `Импорт завершён. Обновлено накладных: ${updatedReceipts}. ` +
                    `Создано новых: ${createdReceipts}. ` +
                    `Добавлено товаров: ${createdItems}.`,
                    8
                );
            } else {
                message.warning(
                    `Импорт завершён с ошибками. Обновлено: ${updatedReceipts}. ` +
                    `Создано новых: ${createdReceipts}. ` +
                    `Добавлено товаров: ${createdItems}. ` +
                    `Ошибок: ${errors.length}. Подробности в консоли браузера.`,
                    10
                );

                console.error('Ошибки импорта:', errors);
            }
        } catch (error: unknown) {
            console.error('Ошибка импорта Excel:', error);

            const errorMessage =
                error instanceof Error ? error.message : String(error);

            message.error(`Ошибка импорта: ${errorMessage}`);
        } finally {
            setLoading(false);

            // Позволяем повторно выбрать тот же файл
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleImport}
            />

            <Button
                type="primary"
                icon={<FileExcelOutlined />}
                loading={loading}
                onClick={() => fileInputRef.current?.click()}
            >
                Импорт из Excel
            </Button>
        </>
    );
};

export default ImportExcelButton;