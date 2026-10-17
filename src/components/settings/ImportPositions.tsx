
import { useState } from 'react';
import { Button, message, Popconfirm } from 'antd';
import { pb } from '../../pocketbase/pocketbase';

type EmployeePositionRow = {
    position?: string;
};

type PositionRecord = {
    id: string;
    name: string;
};

const EMPLOYEES_COLLECTION = 'employees';
const POSITIONS_COLLECTION = 'positions';

const normalizePosition = (value: unknown): string =>
    String(value ?? '').trim().replace(/\s+/g, ' ');

const positionKey = (value: unknown): string =>
    normalizePosition(value).toLocaleLowerCase('ru');

export const ImportPositions = () => {
    const [loading, setLoading] = useState(false);

    const handleImport = async () => {
        if (loading) return;

        setLoading(true);

        try {
            // 1. Загружаем сотрудников и существующие должности.
            const [employees, positions] = await Promise.all([
                pb.collection(EMPLOYEES_COLLECTION)
                    .getFullList<EmployeePositionRow>(),
                pb.collection(POSITIONS_COLLECTION)
                    .getFullList<PositionRecord>(),
            ]);

            // 2. Собираем уникальные названия должностей сотрудников.
            const uniquePositions = new Map<string, string>();

            for (const employee of employees) {
                const name = normalizePosition(employee.position);
                const key = positionKey(name);

                if (key && !uniquePositions.has(key)) {
                    uniquePositions.set(key, name);
                }
            }

            // 3. Индексируем уже существующие должности.
            const existingPositions = new Map<string, PositionRecord>();

            for (const position of positions) {
                const key = positionKey(position.name);

                if (key && !existingPositions.has(key)) {
                    existingPositions.set(key, position);
                }
            }

            // 4. Создаём только отсутствующие должности.
            let created = 0;
            let skipped = 0;

            const errors: Array<{ name: string; reason: string }> = [];

            for (const [key, name] of uniquePositions) {
                if (existingPositions.has(key)) {
                    skipped++;
                    continue;
                }

                try {
                    const record = await pb
                        .collection(POSITIONS_COLLECTION)
                        .create<PositionRecord>({
                            name,
                        });

                    existingPositions.set(key, record);
                    created++;
                } catch (error) {
                    errors.push({
                        name,
                        reason:
                            error instanceof Error
                                ? error.message
                                : 'Неизвестная ошибка PocketBase',
                    });
                }
            }

            console.info('Результат импорта должностей', {
                employees: employees.length,
                uniquePositions: uniquePositions.size,
                created,
                skipped,
                errors,
            });

            if (errors.length > 0) {
                console.table(errors);

                message.warning(
                    `Создано: ${created}. Уже существовало: ${skipped}. Ошибок: ${errors.length}. Подробности в консоли.`,
                );
            } else if (created === 0) {
                message.info(
                    `Новых должностей нет. Уже существует: ${skipped}.`,
                );
            } else {
                message.success(
                    `Импорт завершён. Создано: ${created}, уже существовало: ${skipped}.`,
                );
            }
        } catch (error) {
            console.error('Ошибка импорта должностей:', error);

            message.error(
                'Не удалось прочитать сотрудников или должности. Проверь API Rules и консоль.',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Popconfirm
            title="Импортировать должности?"
            description="Будут созданы отсутствующие должности из employees.position. Сотрудники не изменятся."
            onConfirm={handleImport}
            okText="Импортировать"
            cancelText="Отмена"
        >
            <Button
                loading={loading}
                disabled={loading}
            >
                Импортировать должности
            </Button>
        </Popconfirm>
    );
};
