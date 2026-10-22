
import { useEffect, useState } from "react";
import { Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import {getPositionPpeStandards, type Position, type PpeIssuanceStandard} from "../../hooks/usePositions.tsx";


interface Props {
    position: Position;
}

export function PositionPpeCard({ position }: Props) {
    const [standards, setStandards] =
        useState<PpeIssuanceStandard[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setStandards([]);

            try {
                const data = await getPositionPpeStandards(position.id);

                if (!cancelled) {
                    setStandards(data);
                }
            } catch (error) {
                console.error(error);

                if (!cancelled) {
                    message.error("Не удалось загрузить нормы СИЗ");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, [position.id]);

    const columns: ColumnsType<PpeIssuanceStandard> = [
        {
            title: "Тип СИЗ",
            dataIndex: "ppe_type",
            key: "ppe_type",
        },
        {
            title: "Наименование СИЗ",
            dataIndex: "ppe_name",
            key: "ppe_name",
        },
        {
            title: "Норма выдачи",
            dataIndex: "issuance_norm",
            key: "issuance_norm",
        },
        {
            title: "Основание выдачи",
            dataIndex: "issuance_basis",
            key: "issuance_basis",
        },
    ];

    return (
        <Table<PpeIssuanceStandard>
            rowKey="id"
            columns={columns}
            dataSource={standards}
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{
                emptyText: "Для этой должности нормы СИЗ не найдены",
            }}
        />
    );
}
