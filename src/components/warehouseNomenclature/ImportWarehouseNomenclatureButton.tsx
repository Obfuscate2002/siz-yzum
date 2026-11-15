
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import {pb} from "../../pocketbase/pocketbase.ts";


const COLLECTION = 'warehouse_nomenclature';

const ALLOWED_TYPES = [
    'ОДЕЖДА',
    'ОБУВЬ',
    'ГОЛОВНЫЕ УБОРЫ',
    'СРЕДСТВА ЗАЩИТЫ',
    'ПЕРЧАТКИ',
    'РЕСПИРАТОРЫ',
    'СМЫВАЮЩИЕ СРЕДСТВА',
];

interface WarehouseNomenclatureRecord {
    id: string;
    name: string;
    type: string;
    productCode: string;
    quantity: number;
    unit: string;
}

interface ImportItem {
    name: string;
    type: string;
    productCode: string;
    quantity: number;
    unit: string;
}

interface Props {
    onImported?: () => void;
}

const normalize = (value: unknown): string =>
    String(value ?? '').trim().toLowerCase();

const getText = (value: unknown): string =>
    String(value ?? '').trim();

export const ImportWarehouseNomenclatureButton = ({
                                                      onImported,
                                                  }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);

    const handleImport = async (
        event: ChangeEvent<HTMLInputElement>
    ): Promise<void> => {
        const file = event.target.files?.[0];

        event.target.value = '';

        if (!file) return;

        setLoading(true);

        try {
            // Читаем Excel
            const buffer = await file.arrayBuffer();

            const workbook = XLSX.read(buffer, {
                type: 'array',
            });

            // Используем первый лист
            const sheetName = workbook.SheetNames[0];

            if (!sheetName) {
                message.error('В Excel-файле нет листов');
                return;
            }

            const worksheet = workbook.Sheets[sheetName];

            // Читаем строки по названиям колонок
            const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
                worksheet,
                {
                    defval: '',
                    raw: true,
                }
            );

            if (rows.length === 0) {
                message.warning('В таблице нет товарных позиций');
                return;
            }

            const importItems: ImportItem[] = [];
            let invalidCount = 0;

            for (const row of rows) {
                const name = getText(row.name);
                const type = getText(row.type);
                const rawCode = getText(row.productCode);
                const unit = getText(row.unit);

                const rawQuantity = row.quantity;
                const quantity =
                    typeof rawQuantity === 'number'
                        ? rawQuantity
                        : Number(
                            String(rawQuantity ?? '')
                                .replace(/\s/g, '')
                                .replace(',', '.')
                        );

                // Проверяем обязательные данные
                if (
                    !name ||
                    !ALLOWED_TYPES.includes(type) ||
                    !Number.isFinite(quantity) ||
                    quantity < 0
                ) {
                    invalidCount++;
                    console.warn('Пропущена некорректная строка:', row);
                    continue;
                }

                importItems.push({
                    name,
                    type,
                    productCode: rawCode === '-' ? '' : rawCode,
                    quantity,
                    unit,
                });
            }

            if (importItems.length === 0) {
                message.error('Не найдено корректных товарных позиций');
                return;
            }

            // Получаем существующие записи PocketBase
            const existingRecords =
                await pb.collection(COLLECTION).getFullList<WarehouseNomenclatureRecord>({
                    fields: 'id,name,type,productCode,quantity,unit',
                });

            // Формируем ключи существующих записей
            const existingKeys = new Set(
                existingRecords.map(record =>
                    [
                        normalize(record.name),
                        normalize(record.type),
                        normalize(record.productCode),
                    ].join('|')
                )
            );

            // Убираем товары, которые уже есть в PocketBase
            const newItems = importItems.filter(item => {
                const key = [
                    normalize(item.name),
                    normalize(item.type),
                    normalize(item.productCode),
                ].join('|');

                if (existingKeys.has(key)) {
                    return false;
                }

                // Не допускаем повторное добавление
                // одинаковых товаров из одного файла
                existingKeys.add(key);

                return true;
            });

            if (newItems.length === 0) {
                message.info(
                    `Все ${importItems.length} позиций уже есть в PocketBase`
                );

                return;
            }

            // Импортируем последовательно
            let createdCount = 0;
            let errorCount = 0;

            for (const item of newItems) {
                try {
                    await pb.collection(COLLECTION).create(
                        item,
                        {
                            requestKey: null,
                        }
                    );

                    createdCount++;
                } catch (error) {
                    errorCount++;

                    console.error(
                        `Ошибка импорта "${item.name}":`,
                        error
                    );
                }
            }

            // Показываем результат
            if (createdCount > 0) {
                message.success(
                    `Импортировано позиций: ${createdCount}`
                );

                onImported?.();
            }

            if (errorCount > 0) {
                message.warning(
                    `Ошибок импорта: ${errorCount}`
                );
            }

            if (invalidCount > 0) {
                message.warning(
                    `Пропущено некорректных строк: ${invalidCount}`
                );
            }

        } catch (error) {
            console.error('Ошибка импорта номенклатуры:', error);

            message.error(
                'Ошибка импорта. Проверь подключение к PocketBase и формат Excel.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                hidden
                onChange={handleImport}
            />

            <Button
                icon={<UploadOutlined />}
                loading={loading}
                onClick={() => inputRef.current?.click()}
            >
                Импорт номенклатуры
            </Button>
        </>
    );
};
