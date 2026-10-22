
import { useEffect, useState } from "react";
import { Table, Drawer, Input, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import {getPositions, type Position} from "../../hooks/usePositions.tsx";
import {PositionPpeCard} from "./PositionPpeCard.tsx";


export function PositionsTable() {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedPosition, setSelectedPosition] =
        useState<Position | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                setPositions(await getPositions());
            } catch (error) {
                console.error(error);
                message.error("Не удалось загрузить должности");
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

    const columns: ColumnsType<Position> = [
        {
            title: "Должность",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Код",
            dataIndex: "code",
            key: "code",
        },
    ];

    const filteredPositions = positions.filter((position) =>
        position.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Input
                placeholder="Поиск по должности"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
                style={{ marginBottom: 16, maxWidth: 360 }}
            />

            <Table<Position>
                rowKey="id"
                columns={columns}
                dataSource={filteredPositions}
                loading={loading}
                onRow={(record) => ({
                    onClick: () => setSelectedPosition(record),
                    style: { cursor: "pointer" },
                })}
            />

            <Drawer
                open={selectedPosition !== null}
                onClose={() => setSelectedPosition(null)}
                title={selectedPosition?.name}
                width={900}
                destroyOnHidden
            >
                {selectedPosition && (
                    <PositionPpeCard
                        position={selectedPosition}
                    />
                )}
            </Drawer>
        </>
    );
}
