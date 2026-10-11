import { useState } from 'react';
import { Button, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { pb } from '../../pocketbase/pocketbase';

type PpeRow = {
    name?: string;
    category?: string;
    unit?: string;
    description?: string;
    isActive?: string | boolean;
};

type PpeRecord = {
    id: string;
    name: string;
    category: string;
    unit: string;
    description: string;
    isActive: boolean;
};

type ImportError = {
    row: number;
    name: string;
    reason: string;
};

type ImportPpeItemsProps = {
    onSuccess?: () => void;
};

const COLLECTION = 'ppe_catalog';

const normalize = (value: unknown): string =>
    String(value ?? '').trim();

export const ImportPpeItems = ({
                                   onSuccess,
                               }: ImportPpeItemsProps) => {
    const [loading, setLoading] = useState(false);

    const handleFile: NonNullable<UploadProps['beforeUpload']> =
        async (file) => {
            if (loading) return false;

            setLoading(true);

            try {
                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer, {
                    type: 'array',
                    cellDates: false,
                });

                const firstSheetName = workbook.SheetNames[0];

                if (!firstSheetName) {
                    message.warning('В файле нет листов');
                    return false;
                }

                const sheet = workbook.Sheets[firstSheetName];

                const rows = XLSX.utils.sheet_to_json<PpeRow>(sheet, {
                    defval: '',
                    raw: false,
                });

                if (rows.length === 0) {
                    message.warning('Файл не содержит строк с данными');
                    return false;
                }

                const headers =
                    XLSX.utils.sheet_to_json<string[]>(sheet, {
                        header: 1,
                        defval: '',
                    })[0]?.map(normalize) ?? [];

                const requiredColumns = ['name', 'category', 'unit'];

                const missingColumns = requiredColumns.filter(
                    (column) => !headers.includes(column),
                );

                if (missingColumns.length > 0) {
                    message.error(
                        `Не найдены обязательные столбцы: ${missingColumns.join(', ')}`,
                    );
                    return false;
                }

                const errors: ImportError[] = [];
                const seenNames = new Set<string>();

                const preparedRows = rows.map((row, index) => ({
                    rowNumber: index + 2,
                    name: normalize(row.name),
                    category: normalize(row.category),
                    unit: normalize(row.unit),
                    description: normalize(row.description),
                }));

                const validRows = preparedRows.filter((row) => {
                    if (!row.name) {
                        errors.push({
                            row: row.rowNumber,
                            name: '',
                            reason: 'Не указано наименование СИЗ',
                        });
                        return false;
                    }

                    if (!row.category || !row.unit) {
                        errors.push({
                            row: row.rowNumber,
                            name: row.name,
                            reason: 'Не указана категория или единица измерения',
                        });
                        return false;
                    }

                    const key = row.name.toLocaleLowerCase();

                    if (seenNames.has(key)) {
                        errors.push({
                            row: row.rowNumber,
                            name: row.name,
                            reason: 'Дубликат наименования в файле',
                        });
                        return false;
                    }

                    seenNames.add(key);
                    return true;
                });

                if (validRows.length === 0) {
                    message.error('Нет корректных строк для импорта');
                    console.table(errors);
                    return false;
                }

                const existingItems =
                    await pb.collection(COLLECTION).getFullList<PpeRecord>();

                const itemsByName = new Map<string, PpeRecord[]>();

                for (const item of existingItems) {
                    const key = normalize(item.name).toLocaleLowerCase();

                    if (!key) continue;

                    const records = itemsByName.get(key) ?? [];
                    records.push(item);
                    itemsByName.set(key, records);
                }

                const duplicateNames = validRows.filter(
                    (row) =>
                        (itemsByName.get(
                            row.name.toLocaleLowerCase(),
                        )?.length ?? 0) > 1,
                );

                if (duplicateNames.length > 0) {
                    message.error(
                        'В базе есть дублирующиеся наименования СИЗ. Сначала устраните их.',
                    );
                    console.table(duplicateNames);
                    return false;
                }

                let created = 0;
                let updated = 0;

                for (const row of validRows) {
                    const data = {
                        name: row.name,
                        category: row.category,
                        unit: row.unit,
                        description: row.description,
                    };

                    try {
                        const key = row.name.toLocaleLowerCase();
                        const existing = itemsByName.get(key)?.[0];

                        if (existing) {
                            await pb.collection(COLLECTION).update(
                                existing.id,
                                data,
                            );
                            updated++;
                        } else {
                            const createdItem =
                                await pb.collection(COLLECTION).create({
                                    ...data,
                                    isActive: true,
                                });

                            itemsByName.set(key, [
                                {
                                    ...createdItem,
                                    ...data,
                                    isActive: true,
                                } as PpeRecord,
                            ]);

                            created++;
                        }
                    } catch (error) {
                        errors.push({
                            row: row.rowNumber,
                            name: row.name,
                            reason:
                                error instanceof Error
                                    ? error.message
                                    : 'Неизвестная ошибка PocketBase',
                        });
                    }
                }

                console.info('Результат импорта СИЗ', {
                    total: rows.length,
                    created,
                    updated,
                    errors,
                });

                if (errors.length > 0) {
                    message.warning(
                        `Создано: ${created}, обновлено: ${updated}, ошибок: ${errors.length}. Подробности в консоли.`,
                    );
                    console.table(errors);
                } else {
                    message.success(
                        `Импорт завершён. Создано: ${created}, обновлено: ${updated}.`,
                    );
                }

                if (created > 0 || updated > 0) {
                    onSuccess?.();
                }

                return false;
            } catch (error) {
                console.error('Ошибка импорта СИЗ:', error);
                message.error(
                    'Не удалось прочитать файл или получить данные из PocketBase',
                );
                return false;
            } finally {
                setLoading(false);
            }
        };

    return (
        <Upload
            accept=".xlsx,.xls,.csv"
            showUploadList={false}
            beforeUpload={handleFile}
            maxCount={1}
        >
            <Button
                icon={<UploadOutlined />}
                loading={loading}
                disabled={loading}
            >
                Импорт СИЗ из Excel
            </Button>
        </Upload>
    );
};