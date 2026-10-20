
import { useState } from 'react';
import { Button, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { pb } from '../../pocketbase/pocketbase';

type PpeRow = {
    ppe_type?: string;
    ppe_name?: string;
    issuance_norm?: string;
    issuance_basis?: string;
    position_name?: string;
};

type ImportError = {
    row: number;
    ppe_name: string;
    reason: string;
};

type ImportPpeProps = {
    onSuccess?: () => void;
};

const COLLECTION = 'ppe_issuance_standards';

const normalize = (value: unknown): string =>
    String(value ?? '').trim();

const normalizeHeader = (value: unknown): string =>
    normalize(value)
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[ё]/g, 'е');

const HEADER_ALIASES: Record<string, string[]> = {
    ppe_type: [
        'Тип СИЗ',
        'ppe_type',
    ],
    ppe_name: [
        'Наименование СИЗ, конструкция, класс защиты',
        'Наименование СИЗ',
        'ppe_name',
    ],
    issuance_norm: [
        'Нормы выдачи',
        'issuance_norm',
    ],
    issuance_basis: [
        'Основание выдачи',
        'issuance_basis',
    ],
    position_name: [
        'Наименование профессии/должности',
        'Наименование профессии / должности',
        'Профессия/должность',
        'position_name',
    ],
};

const findColumnIndexes = (headers: string[]) => {
    const normalizedHeaders = headers.map(normalizeHeader);

    return Object.fromEntries(
        Object.entries(HEADER_ALIASES).map(([field, aliases]) => [
            field,
            normalizedHeaders.findIndex((header) =>
                aliases.some(
                    (alias) => normalizeHeader(alias) === header,
                ),
            ),
        ]),
    ) as Record<keyof PpeRow, number>;
};

export const ImportPpeIssuanceStandards = ({
                                               onSuccess,
                                           }: ImportPpeProps) => {
    const [loading, setLoading] = useState(false);

    const handleFile: NonNullable<UploadProps['beforeUpload']> = async (
        file,
    ) => {
        if (loading) {
            return false;
        }

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

            const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
                header: 1,
                defval: '',
                raw: false,
            });

            if (rows.length < 2) {
                message.warning('Файл не содержит строк с данными');
                return false;
            }

            const headers = (rows[0] ?? []).map(normalize);
            const columns = findColumnIndexes(headers);

            const missingColumns = (
                Object.keys(HEADER_ALIASES) as (keyof PpeRow)[]
            ).filter((field) => columns[field] === -1);

            if (missingColumns.length > 0) {
                message.error(
                    `Не найдены столбцы: ${missingColumns
                        .map((field) => HEADER_ALIASES[field][0])
                        .join(', ')}`,
                );
                return false;
            }

            const preparedRows = rows.slice(1).map((cells, index) => {
                const getValue = (field: keyof PpeRow) =>
                    normalize(cells[columns[field]]);

                return {
                    rowNumber: index + 2,
                    ppe_type: getValue('ppe_type'),
                    ppe_name: getValue('ppe_name'),
                    issuance_norm: getValue('issuance_norm'),
                    issuance_basis: getValue('issuance_basis'),
                    position_name: getValue('position_name'),
                };
            });

            const errors: ImportError[] = [];
            const validRows: PpeRow[] = [];

            for (const row of preparedRows) {
                // Пропускаем полностью пустые строки.
                if (
                    !row.ppe_type &&
                    !row.ppe_name &&
                    !row.issuance_norm &&
                    !row.issuance_basis &&
                    !row.position_name
                ) {
                    continue;
                }

                if (!row.ppe_name) {
                    errors.push({
                        row: row.rowNumber,
                        ppe_name: '',
                        reason: 'Не указано наименование СИЗ',
                    });
                    continue;
                }

                if (!row.position_name) {
                    errors.push({
                        row: row.rowNumber,
                        ppe_name: row.ppe_name,
                        reason: 'Не указана профессия или должность',
                    });
                    continue;
                }

                validRows.push({
                    ppe_type: row.ppe_type,
                    ppe_name: row.ppe_name,
                    issuance_norm: row.issuance_norm,
                    issuance_basis: row.issuance_basis,
                    position_name: row.position_name,
                });
            }

            if (validRows.length === 0) {
                message.error('Нет корректных строк для импорта');

                if (errors.length > 0) {
                    console.table(errors);
                }

                return false;
            }

            let created = 0;

            for (const row of validRows) {
                try {
                    await pb.collection(COLLECTION).create({
                        ppe_type: row.ppe_type ?? '',
                        ppe_name: row.ppe_name ?? '',
                        issuance_norm: row.issuance_norm ?? '',
                        issuance_basis: row.issuance_basis ?? '',
                        position_name: row.position_name ?? '',
                    });

                    created++;
                } catch (error) {
                    errors.push({
                        row: preparedRows.findIndex(
                            (item) =>
                                item.ppe_name === row.ppe_name &&
                                item.position_name === row.position_name,
                        ) + 2,
                        ppe_name: row.ppe_name ?? '',
                        reason:
                            error instanceof Error
                                ? error.message
                                : 'Ошибка PocketBase',
                    });
                }
            }

            console.info('Результат импорта норм СИЗ', {
                total: preparedRows.length,
                created,
                errors,
            });

            if (errors.length > 0) {
                message.warning(
                    `Создано: ${created}, ошибок: ${errors.length}. Подробности в консоли.`,
                );
                console.table(errors);
            } else {
                message.success(
                    `Импорт завершён. Создано записей: ${created}`,
                );
            }

            if (created > 0) {
                onSuccess?.();
            }

            return false;
        } catch (error) {
            console.error('Ошибка импорта норм СИЗ:', error);
            message.error(
                'Не удалось прочитать файл или записать данные в PocketBase',
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
                Импорт норм СИЗ из Excel ()
            </Button>
        </Upload>
    );
};
