
import { useState } from 'react';
import { Button, message, Modal } from 'antd';
import { pb } from '../../pocketbase/pocketbase';

type EmployeeRecord = {
    id: string;
    fullName: string;
    personnelNumber: string;
    position?: string;
    positionRelation?: string;
};

type PositionRecord = {
    id: string;
    name: string;
};

type MigrationError = {
    employee: string;
    position: string;
    reason: string;
};

const EMPLOYEES_COLLECTION = 'employees';
const POSITIONS_COLLECTION = 'positions';

const normalize = (value: unknown): string =>
    String(value ?? '').trim().replace(/\s+/g, ' ');

const normalizeKey = (value: unknown): string =>
    normalize(value).toLocaleLowerCase('ru');

export const MigrateEmployeePositions = () => {
    const [loading, setLoading] = useState(false);

    const handleMigration = async () => {
        if (loading) return;

        setLoading(true);

        try {
            const [employees, positions] = await Promise.all([
                pb.collection(EMPLOYEES_COLLECTION)
                    .getFullList<EmployeeRecord>(),
                pb.collection(POSITIONS_COLLECTION)
                    .getFullList<PositionRecord>(),
            ]);

            const positionsByName = new Map<string, PositionRecord[]>();

            for (const position of positions) {
                const key = normalizeKey(position.name);
                if (!key) continue;

                const matches = positionsByName.get(key) ?? [];
                matches.push(position);
                positionsByName.set(key, matches);
            }

            let linked = 0;
            let alreadyLinked = 0;
            let unmatched = 0;
            let failed = 0;

            const errors: MigrationError[] = [];

            for (const employee of employees) {
                const employeeLabel =
                    `${employee.fullName} (${employee.personnelNumber})`;

                const positionName = normalize(employee.position);
                const key = normalizeKey(positionName);

                if (!key) {
                    unmatched++;
                    errors.push({
                        employee: employeeLabel,
                        position: '',
                        reason: 'У сотрудника не указана должность',
                    });
                    continue;
                }

                const matches = positionsByName.get(key) ?? [];

                if (matches.length === 0) {
                    unmatched++;
                    errors.push({
                        employee: employeeLabel,
                        position: positionName,
                        reason: 'Должность не найдена в positions',
                    });
                    continue;
                }

                if (matches.length > 1) {
                    unmatched++;
                    errors.push({
                        employee: employeeLabel,
                        position: positionName,
                        reason: 'Найдено несколько записей должности',
                    });
                    continue;
                }

                const position = matches[0];

                if (employee.positionRelation === position.id) {
                    alreadyLinked++;
                    continue;
                }

                try {
                    await pb.collection(EMPLOYEES_COLLECTION).update(
                        employee.id,
                        {
                            positionRelation: position.id,
                        },
                    );

                    linked++;
                } catch (error) {
                    failed++;
                    errors.push({
                        employee: employeeLabel,
                        position: positionName,
                        reason:
                            error instanceof Error
                                ? error.message
                                : 'Неизвестная ошибка PocketBase',
                    });
                }
            }

            console.info('Результат миграции должностей', {
                total: employees.length,
                linked,
                alreadyLinked,
                unmatched,
                failed,
                errors,
            });

            if (errors.length > 0) {
                console.table(errors);
            }

            Modal.info({
                title: 'Миграция должностей завершена',
                width: 560,
                content: (
                    <div>
                        <p>Всего сотрудников: {employees.length}</p>
                        <p>Связано сейчас: {linked}</p>
                        <p>Уже были связаны: {alreadyLinked}</p>
                        <p>Не удалось сопоставить: {unmatched}</p>
                        <p>Ошибки обновления: {failed}</p>
                        {errors.length > 0 && (
                            <p>
                                Подробности ошибок доступны в консоли
                                браузера.
                            </p>
                        )}
                    </div>
                ),
            });
        } catch (error) {
            console.error('Ошибка миграции должностей:', error);
            message.error(
                'Не удалось загрузить данные. Проверь API Rules PocketBase.',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            loading={loading}
            disabled={loading}
            onClick={() => {
                Modal.confirm({
                    title: 'Связать сотрудников с должностями?',
                    content:
                        'Будет заполнено поле positionRelation по старому текстовому полю position. Остальные поля сотрудников не изменятся.',
                    okText: 'Начать миграцию',
                    cancelText: 'Отмена',
                    onOk: handleMigration,
                });
            }}
        >
            Связать сотрудников с должностями
        </Button>
    );
};
