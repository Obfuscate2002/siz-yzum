
import { useState } from "react";
import { Button, message } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";
import PocketBase from "pocketbase";

interface ImportDivisionsProps {
    pb: PocketBase;
}

const divisionsData = [
    "Административно-хозяйственный отдел",
    "Дирекция",
    "Основное производство",
    "Отдел информационных разработок",
    "Отдел качества",
    "Отдел охраны труда и экологической безопасности",
    "Отдел подготовки производства",
    "Отдел эксплуатации",
    "Склад",
    "Служба главного механика",
    "Служба главного технолога",
    "Цех гофрокартона",
    "Цех гофротары",
];

const normalizeName = (value: string) =>
    value.trim().replace(/\s+/g, " ").toLowerCase();

export const ImportDivisions = ({ pb }: ImportDivisionsProps) => {
    const [loading, setLoading] = useState(false);

    const handleImport = async () => {
        setLoading(true);

        let added = 0;
        let skipped = 0;
        const errors: string[] = [];

        try {
            // Получаем уже существующие подразделения
            const existingRecords = await pb.collection("divisions").getFullList({
                fields: "id,name",
            });

            const existingNames = new Set(
                existingRecords.map((item) => normalizeName(item.name || ""))
            );

            // Импортируем только отсутствующие подразделения
            for (const name of divisionsData) {
                const normalizedName = normalizeName(name);

                if (!normalizedName || existingNames.has(normalizedName)) {
                    skipped++;
                    continue;
                }

                try {
                    await pb.collection("divisions").create({
                        name,
                    });

                    existingNames.add(normalizedName);
                    added++;
                } catch (error) {
                    console.error(`Ошибка импорта "${name}":`, error);
                    errors.push(name);
                }
            }

            if (errors.length === 0) {
                message.success(
                    `Импорт завершён. Добавлено: ${added}, пропущено: ${skipped}`
                );
            } else {
                message.warning(
                    `Добавлено: ${added}, пропущено: ${skipped}, ошибок: ${errors.length}`
                );
                console.error("Не удалось импортировать:", errors);
            }
        } catch (error) {
            console.error("Ошибка импорта подразделений:", error);
            message.error("Не удалось получить данные из PocketBase");
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
            Импортировать подразделения
        </Button>
    );
};
