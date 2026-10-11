import { useState } from 'react';
import { Button, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { pb } from '../../pocketbase/pocketbase';

type EmployeeRow = {
    fullName?: string;
    unit?: string;
    personnelNumber?: string | number;
    position?: string;
    comment?: string;
    height?: string | number;
    clothingSize?: string | number;
    shoeSize?: string | number;
};

type EmployeeRecord = {
    id: string;
    fullName: string;
    unit: string;
    personnelNumber: string;
    position: string;
    comment: string;
    height: string;
    clothingSize: string;
    shoeSize: string;
    isActive: boolean;
};

type ImportError = {
    row: number;
    personnelNumber: string;
    reason: string;
};

type ImportEmployeesProps = {
    onSuccess?: () => void;
};

const COLLECTION = 'employees';

const normalize = (value: unknown): string =>
    String(value ?? '').trim();

export const ImportEmployees = ({
                                    onSuccess,
                                }: ImportEmployeesProps) => {
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

            const rows = XLSX.utils.sheet_to_json<EmployeeRow>(sheet, {
                defval: '',
                raw: false,
            });

            if (rows.length === 0) {
                message.warning('Файл не содержит строк с данными');
                return false;
            }

            const requiredColumns = [
                'fullName',
                'personnelNumber',
                'position',
                'unit',
            ];

            const headers = XLSX.utils.sheet_to_json<string[]>(sheet, {
                header: 1,
                defval: '',
            })[0]?.map(normalize) ?? [];

            const missingColumns = requiredColumns.filter(
                (column) => !headers.includes(column),
            );

            if (missingColumns.length > 0) {
                message.error(
                    `Не найдены обязательные столбцы: ${missingColumns.join(', ')}`,
                );
                return false;
            }

            const preparedRows = rows.map((row, index) => ({
                rowNumber: index + 2,
                fullName: normalize(row.fullName),
                unit: normalize(row.unit),
                personnelNumber: normalize(row.personnelNumber),
                position: normalize(row.position),
                comment: normalize(row.comment),
                height: normalize(row.height),
                clothingSize: normalize(row.clothingSize),
                shoeSize: normalize(row.shoeSize),
            }));

            const errors: ImportError[] = [];
            const validRows = [];
            const seenNumbers = new Set<string>();

            for (const row of preparedRows) {
                if (!row.personnelNumber) {
                    errors.push({
                        row: row.rowNumber,
                        personnelNumber: '',
                        reason: 'Не указан табельный номер',
                    });
                    continue;
                }

                if (!row.fullName) {
                    errors.push({
                        row: row.rowNumber,
                        personnelNumber: row.personnelNumber,
                        reason: 'Не указано ФИО',
                    });
                    continue;
                }

                if (seenNumbers.has(row.personnelNumber)) {
                    errors.push({
                        row: row.rowNumber,
                        personnelNumber: row.personnelNumber,
                        reason: 'Дубликат табельного номера в файле',
                    });
                    continue;
                }

                seenNumbers.add(row.personnelNumber);
                validRows.push(row);
            }

            if (validRows.length === 0) {
                message.error('Нет корректных строк для импорта');
                console.table(errors);
                return false;
            }

            // Загружаем существующих сотрудников один раз.
            const existingEmployees =
                await pb.collection(COLLECTION).getFullList<EmployeeRecord>();

            const employeesByNumber = new Map<string, EmployeeRecord[]>();

            for (const employee of existingEmployees) {
                const number = normalize(employee.personnelNumber);

                if (!number) continue;

                const records = employeesByNumber.get(number) ?? [];
                records.push(employee);
                employeesByNumber.set(number, records);
            }

            // Не обновляем неоднозначные записи, если в базе уже есть дубликаты.
            const duplicateNumbers = validRows.filter(
                (row) => (employeesByNumber.get(row.personnelNumber)?.length ?? 0) > 1,
            );

            if (duplicateNumbers.length > 0) {
                message.error(
                    'В базе есть дублирующиеся табельные номера. Сначала устраните их.',
                );
                console.table(
                    duplicateNumbers.map((row) => ({
                        row: row.rowNumber,
                        personnelNumber: row.personnelNumber,
                    })),
                );
                return false;
            }

            let created = 0;
            let updated = 0;

            for (const row of validRows) {
                const data = {
                    fullName: row.fullName,
                    unit: row.unit,
                    personnelNumber: row.personnelNumber,
                    position: row.position,
                    comment: row.comment,
                    height: row.height,
                    clothingSize: row.clothingSize,
                    shoeSize: row.shoeSize,
                };

                try {
                    const existing = employeesByNumber.get(
                        row.personnelNumber,
                    )?.[0];

                    if (existing) {
                        await pb.collection(COLLECTION).update(
                            existing.id,
                            data,
                        );
                        updated++;
                    } else {
                        const createdEmployee =
                            await pb.collection(COLLECTION).create({
                                ...data,
                                isActive: true,
                            });

                        // Не допускаем повторного создания номера
                        // в пределах текущего импорта.
                        employeesByNumber.set(row.personnelNumber, [
                            {
                                ...createdEmployee,
                                ...data,
                                isActive: true,
                            } as EmployeeRecord,
                        ]);

                        created++;
                    }
                } catch (error) {
                    errors.push({
                        row: row.rowNumber,
                        personnelNumber: row.personnelNumber,
                        reason: error instanceof Error
                            ? error.message
                            : 'Неизвестная ошибка PocketBase',
                    });
                }
            }

            console.info('Результат импорта сотрудников', {
                total: rows.length,
                created,
                updated,
                errors,
            });

            if (errors.length > 0) {
                message.warning(
                    `Создано: ${created}, обновлено: ${updated}, ошибок: ${errors.length}. Подробности в консоли.`,
                );
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
            console.error('Ошибка импорта сотрудников:', error);
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
                Импорт сотрудников из Excel
            </Button>
        </Upload>
    );
};
