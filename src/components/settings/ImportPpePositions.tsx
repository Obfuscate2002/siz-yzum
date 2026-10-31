
import React, { useState } from "react";
import { Button, Modal, message } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";
import PocketBase from "pocketbase";

interface ImportPpePositionsProps {
    pb: PocketBase;
}

interface Division {
    id: string;
    name: string;
    ppe_positions?: string[];
}

interface Position {
    id: string;
    name: string;
}

const positionsData = [
    ["Автоматчик картонажного производства 3 разряда", "Цех гофрокартона"],
    ["Автоматчик картонажного производства 4 разряда", "Цех гофрокартона"],
    ["Автоматчик картонажного производства 5 разряда", "Цех гофрокартона"],
    ["Ведущий инженер-механик", "Служба главного механика"],
    ["Ведущий инженер-электроник", "Служба главного механика"],
    ["Ведущий инженер-энергетик", "Отдел эксплуатации"],
    ["Водитель погрузчика (авто)", "Склад"],
    ["Водитель погрузчика (электро)", "Цех гофрокартона"],
    ["Главный механик", "Служба главного механика"],
    ["Главный технолог", "Служба главного технолога"],
    ["Дворник", "Административно-хозяйственный отдел"],
    ["Директор по производству", "Дирекция"],
    ["Заведующий складом", "Склад"],
    ["Инженер по входному контролю", "Отдел качества"],
    ["Инженер по оборудованию", "Служба главного механика"],
    ["Инженер по строительному контролю", "Отдел эксплуатации"],
    ["Инженер-технолог", "Служба главного технолога"],
    ["Инженер-электроник", "Служба главного механика"],
    ["Мастер отдела эксплуатации", "Отдел эксплуатации"],
    ["Мастер цеха", "Основное производство"],
    ["Машинист гофрировального агрегата 4 разряда", "Цех гофрокартона"],
    ["Машинист машины по производству изделий из бумаги 3 разряда", "Цех гофротары"],
    ["Менеджер по приемке и отгрузке, менеджер ТМЦ", "Склад"],
    ["Механик", "Служба главного механика"],
    ["Наладчик контрольно-измерительных приборов и автоматики 5 разряда", "Служба главного механика"],
    ["Наладчик контрольно-измерительных приборов и автоматики 6 разряда", "Служба главного механика"],
    ["Начальник административно-хозяйственного отдела", "Административно-хозяйственный отдел"],
    ["Начальник отдела качества", "Отдел качества"],
    ["Начальник отдела эксплуатации", "Отдел эксплуатации"],
    ["Начальник производства", "Основное производство"],
    ["Начальник смены", "Основное производство"],
    ["Оператор автоматических и полуавтоматических линий станков и установок 2 разряда", "Цех гофрокартона"],
    ["Оператор автоматических и полуавтоматических линий, станков и установок 2 разряда", "Цех гофротары"],
    ["Оператор автоматических и полуавтоматических линий, станков и установок 3 разряда", "Цех гофрокартона"],
    ["Оператор тигельного пресса", "Цех гофротары"],
    ["Печатник печатно-высекального автомата 3 разряда", "Цех гофротары"],
    ["Печатник печатно-высекального автомата 4 разряда", "Цех гофротары"],
    ["Печатник печатно-высекального автомата 5 разряда", "Цех гофротары"],
    ["Рабочий по комплексному обслуживанию и ремонту зданий", "Отдел эксплуатации"],
    ["Разнорабочий", "Административно-хозяйственный отдел"],
    ["Руководитель склада", "Склад"],
    ["Слесарь-инструментальщик 3 разряда", "Отдел подготовки производства"],
    ["Слесарь-ремонтник 5 разряда", "Служба главного механика"],
    ["Слесарь-ремонтник 6 разряда", "Служба главного механика"],
    ["Специалист по качеству", "Отдел качества"],
    ["Специалист по пожарной профилактике", "Отдел охраны труда и экологической безопасности"],
    ["Специалист по учету сырья и товарно-материальных ценностей", "Цех гофрокартона"],
    ["Техник", "Отдел подготовки производства"],
    ["Техник по компьютерным системам", "Отдел информационных разработок"],
    ["Техник-наладчик", "Цех гофротары"],
    ["Технический директор", "Дирекция"],
    ["Транспортировщик", "Склад"],
    ["Транспортировщик", "Цех гофротары"],
    ["Уборщик производственных помещений", "Административно-хозяйственный отдел"],
    ["Уборщик служебных помещений", "Административно-хозяйственный отдел"],
    ["Электромонтер по ремонту и обслуживанию электрооборудования 5 разряда", "Отдел эксплуатации"],
] as const;

const normalize = (value: string) =>
    value.trim().replace(/\s+/g, " ").toLowerCase();

const ImportPpePositions: React.FC<ImportPpePositionsProps> = ({ pb }) => {
    const [loading, setLoading] = useState(false);

    const handleImport = async () => {
        setLoading(true);

        let linked = 0;
        let skipped = 0;
        let updated = 0;

        const errors: string[] = [];

        try {
            // 1. Загружаем подразделения
            const divisions = await pb
                .collection("divisions")
                .getFullList<Division>({
                    fields: "id,name,ppe_positions",
                    sort: "name",
                });

            const divisionMap = new Map(
                divisions.map((division) => [
                    normalize(division.name),
                    division,
                ])
            );

            // 2. Загружаем существующие должности
            const positions = await pb
                .collection("positions")
                .getFullList<Position>({
                    fields: "id,name",
                });

            const positionsMap = new Map(
                positions.map((position) => [
                    normalize(position.name),
                    position,
                ])
            );

            // 3. Группируем должности по подразделениям
            const grouped = new Map<string, Set<string>>();

            for (const [positionName, divisionName] of positionsData) {
                const divisionKey = normalize(divisionName);
                const positionKey = normalize(positionName);

                if (!grouped.has(divisionKey)) {
                    grouped.set(divisionKey, new Set<string>());
                }

                grouped.get(divisionKey)!.add(positionKey);

                if (!divisionMap.has(divisionKey)) {
                    errors.push(`Не найдено подразделение: ${divisionName}`);
                }
            }

            // 4. Проверяем наличие всех должностей
            for (const [positionName] of positionsData) {
                const key = normalize(positionName);

                if (!positionsMap.has(key)) {
                    errors.push(`Не найдена должность в positions: ${positionName}`);
                }
            }

            // Если есть отсутствующие данные, ничего не записываем
            if (errors.length > 0) {
                Modal.error({
                    title: "Импорт остановлен",
                    content: (
                        <div>
                            <p>Не удалось найти все подразделения или должности.</p>
                            <ul>
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                            <p>Данные PocketBase не изменялись.</p>
                        </div>
                    ),
                });
                return;
            }

            // 5. Записываем связи в ppe_positions
            for (const [divisionKey, positionKeys] of grouped) {
                const division = divisionMap.get(divisionKey);

                if (!division) continue;

                const currentRelations = Array.isArray(division.ppe_positions)
                    ? division.ppe_positions
                    : [];

                const relationIds = new Set(currentRelations);

                for (const positionKey of positionKeys) {
                    const position = positionsMap.get(positionKey);

                    if (!position) continue;

                    if (relationIds.has(position.id)) {
                        skipped++;
                    } else {
                        relationIds.add(position.id);
                        linked++;
                    }
                }

                // Проверяем ограничение Relation
                if (relationIds.size > 10) {
                    errors.push(
                        `В подразделении "${division.name}" больше 10 должностей. Связи не записаны.`
                    );
                    continue;
                }

                // Не обновляем запись, если связи уже совпадают
                const newRelations = Array.from(relationIds);

                const unchanged =
                    currentRelations.length === newRelations.length &&
                    currentRelations.every((id) => relationIds.has(id));

                if (unchanged) continue;

                try {
                    await pb.collection("divisions").update(division.id, {
                        ppe_positions: newRelations,
                    });

                    updated++;
                } catch (error) {
                    console.error(
                        `Ошибка обновления подразделения ${division.name}:`,
                        error
                    );

                    errors.push(
                        `Не удалось записать связи для подразделения: ${division.name}`
                    );
                }
            }

            // 6. Показываем результат
            Modal.info({
                title: "Результат импорта должностей по СИЗ",
                width: 500,
                content: (
                    <div>
                        <p>
                            Сочетаний в исходном списке: <b>{positionsData.length}</b>
                        </p>
                        <p>
                            Добавлено новых связей: <b>{linked}</b>
                        </p>
                        <p>
                            Уже существовало связей: <b>{skipped}</b>
                        </p>
                        <p>
                            Обновлено подразделений: <b>{updated}</b>
                        </p>
                        <p>
                            Ошибок: <b>{errors.length}</b>
                        </p>

                        {errors.length > 0 && (
                            <ul>
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                ),
            });

            if (errors.length === 0) {
                message.success("Связи по СИЗ успешно обновлены!");
            } else {
                message.warning("Импорт завершён с ошибками");
            }
        } catch (error) {
            console.error("Ошибка импорта:", error);
            message.error("Не удалось выполнить импорт");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            type="primary"
            icon={<DatabaseOutlined />}
            loading={loading}
            onClick={handleImport}
        >
            Импортировать должности по СИЗ
        </Button>
    );
};

export default ImportPpePositions;
