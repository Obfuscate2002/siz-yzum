import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Descriptions, Space, Spin, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import type PocketBase from "pocketbase";

const { Text, Title } = Typography;

interface Division {
    id: string;
    name: string;
    ppe_positions?: string[];
    contract_positions?: string[];
}

interface ContractPosition {
    id: string;
    name: string;
    division?: string | string[];
}

interface Position {
    id: string;
    name: string;
    profession?: string;
    code?: string;
}

interface DivisionReport {
    id: string;
    name: string;
    ppeCount: number;
    contractCountBefore: number;
    contractCountAfter: number;
    ppeIds: string[];
    contractIds: string[];
    status: "updated" | "error" | "skipped";
    error?: string;
}

interface Props {
    pb: PocketBase;
}

const COLLECTIONS = {
    divisions: "divisions",
    positions: "positions",
    contractPositions: "contract_positions",
};

const UpdateDivisionRelations: React.FC<Props> = ({ pb }) => {
    const [loading, setLoading] = useState(false);
    const [divisions, setDivisions] = useState<DivisionReport[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [summary, setSummary] = useState({
        divisions: 0,
        ppeRelations: 0,
        contractRelations: 0,
        updated: 0,
        errors: 0,
    });
    const [diagnostics, setDiagnostics] = useState<Division[]>([]);
    const [errorText, setErrorText] = useState<string>("");

    const normalizeRelation = (value?: string | string[]): string[] => {
        if (!value) return [];
        return Array.isArray(value) ? value : [value];
    };

    const loadDiagnostics = async () => {
        setLoading(true);
        setErrorText("");

        try {
            const [divisionRecords, positionRecords] = await Promise.all([
                pb.collection(COLLECTIONS.divisions).getFullList<Division>({
                    sort: "name",
                }),
                pb.collection(COLLECTIONS.positions).getFullList<Position>({
                    sort: "name",
                }),
            ]);

            setDiagnostics(divisionRecords);
            setPositions(positionRecords);

            const ppeRelations = divisionRecords.reduce(
                (sum, division) =>
                    sum + normalizeRelation(division.ppe_positions).length,
                0
            );

            setSummary({
                divisions: divisionRecords.length,
                ppeRelations,
                contractRelations: 0,
                updated: 0,
                errors: 0,
            });

            message.success("Диагностика загружена");
        } catch (error) {
            console.error(error);
            setErrorText(
                error instanceof Error ? error.message : "Не удалось загрузить данные"
            );
            message.error("Ошибка загрузки данных");
        } finally {
            setLoading(false);
        }
    };

    const updateRelations = async () => {
        setLoading(true);
        setErrorText("");
        setDivisions([]);

        try {
            const [divisionRecords, contractRecords] = await Promise.all([
                pb.collection(COLLECTIONS.divisions).getFullList<Division>({
                    sort: "name",
                }),
                pb.collection(COLLECTIONS.contractPositions).getFullList<ContractPosition>(),
            ]);

            const reports: DivisionReport[] = [];

            let totalPpeRelations = 0;
            let totalContractRelations = 0;
            let updatedCount = 0;
            let errorCount = 0;

            for (const division of divisionRecords) {
                const ppeIds = normalizeRelation(division.ppe_positions);

                const contractIds = contractRecords
                    .filter((position) => {
                        const linkedDivision = normalizeRelation(position.division);
                        return linkedDivision.includes(division.id);
                    })
                    .map((position) => position.id);

                totalPpeRelations += ppeIds.length;
                totalContractRelations += contractIds.length;

                try {
                    // Не перезаписываем ppe_positions:
                    // используем уже существующие связи, если они есть.
                    await pb.collection(COLLECTIONS.divisions).update(division.id, {
                        contract_positions: contractIds,
                    });

                    updatedCount++;

                    reports.push({
                        id: division.id,
                        name: division.name,
                        ppeCount: ppeIds.length,
                        contractCountBefore: normalizeRelation(
                            division.contract_positions
                        ).length,
                        contractCountAfter: contractIds.length,
                        ppeIds,
                        contractIds,
                        status: "updated",
                    });
                } catch (error) {
                    errorCount++;

                    reports.push({
                        id: division.id,
                        name: division.name,
                        ppeCount: ppeIds.length,
                        contractCountBefore: normalizeRelation(
                            division.contract_positions
                        ).length,
                        contractCountAfter: contractIds.length,
                        ppeIds,
                        contractIds,
                        status: "error",
                        error:
                            error instanceof Error ? error.message : "Неизвестная ошибка",
                    });
                }
            }

            setDivisions(reports);
            setSummary({
                divisions: divisionRecords.length,
                ppeRelations: totalPpeRelations,
                contractRelations: totalContractRelations,
                updated: updatedCount,
                errors: errorCount,
            });

            if (errorCount === 0) {
                message.success("Связи по трудовым договорам обновлены");
            } else {
                message.warning(`Обновлено с ошибками: ${errorCount}`);
            }
        } catch (error) {
            console.error(error);
            setErrorText(
                error instanceof Error ? error.message : "Не удалось обновить связи"
            );
            message.error("Ошибка обновления связей");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDiagnostics();
    }, []);

    const columns: ColumnsType<DivisionReport> = [
        {
            title: "Подразделение",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Должности по СИЗ",
            dataIndex: "ppeCount",
            key: "ppeCount",
            width: 150,
            render: (value: number) => (
                <Tag color={value > 0 ? "green" : "orange"}>{value}</Tag>
            ),
        },
        {
            title: "Должности по ТД до обновления",
            dataIndex: "contractCountBefore",
            key: "contractCountBefore",
            width: 190,
        },
        {
            title: "Должности по ТД после обновления",
            dataIndex: "contractCountAfter",
            key: "contractCountAfter",
            width: 190,
        },
        {
            title: "Статус",
            dataIndex: "status",
            key: "status",
            render: (status: DivisionReport["status"]) => {
                if (status === "updated") return <Tag color="success">Обновлено</Tag>;
                if (status === "error") return <Tag color="error">Ошибка</Tag>;
                return <Tag>Пропущено</Tag>;
            },
        },
        {
            title: "Ошибка",
            dataIndex: "error",
            key: "error",
            render: (value?: string) =>
                value ? <Text type="danger">{value}</Text> : "—",
        },
    ];

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <div>
                    <Title level={3}>Связи подразделений с должностями</Title>
                    <Text type="secondary">
                        Диагностика и обновление связей в коллекции divisions.
                    </Text>
                </div>

                <Alert
                    type="info"
                    showIcon
                    message="Поле ppe_positions не перезаписывается"
                    description="Компонент использует только актуальное поле ppe_positions. Если оно пустое, связи по СИЗ нужно восстановить из исходного импорта или Excel. Компонент не пытается угадывать эти связи."
                />

                {errorText && (
                    <Alert
                        type="error"
                        showIcon
                        message="Ошибка"
                        description={errorText}
                    />
                )}

                <Descriptions bordered size="small" column={2}>
                    <Descriptions.Item label="Подразделений">
                        {summary.divisions}
                    </Descriptions.Item>
                    <Descriptions.Item label="Связей по СИЗ">
                        <Text strong>{summary.ppeRelations}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Связей по ТД">
                        <Text strong>{summary.contractRelations}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Обновлено">
                        {summary.updated}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ошибок">
                        {summary.errors}
                    </Descriptions.Item>
                    <Descriptions.Item label="Должностей в positions">
                        {positions.length}
                    </Descriptions.Item>
                </Descriptions>

                <Space wrap>
                    <Button onClick={loadDiagnostics} loading={loading}>
                        Проверить данные
                    </Button>

                    <Button
                        type="primary"
                        onClick={updateRelations}
                        loading={loading}
                    >
                        Обновить связи по ТД
                    </Button>
                </Space>

                {loading && <Spin tip="Загрузка..." />}

                {diagnostics.length > 0 && (
                    <>
                        <Title level={4}>Диагностика поля ppe_positions</Title>
                        <Table
                            rowKey="id"
                            size="small"
                            pagination={false}
                            dataSource={diagnostics.map((division) => ({
                                ...division,
                                ppeCount: normalizeRelation(division.ppe_positions).length,
                                ppeIds: normalizeRelation(division.ppe_positions),
                            }))}
                            columns={[
                                {
                                    title: "Подразделение",
                                    dataIndex: "name",
                                    key: "name",
                                },
                                {
                                    title: "Количество связей СИЗ",
                                    dataIndex: "ppeCount",
                                    key: "ppeCount",
                                    width: 180,
                                    render: (count: number) => (
                                        <Tag color={count > 0 ? "green" : "orange"}>{count}</Tag>
                                    ),
                                },
                                {
                                    title: "ID связанных должностей",
                                    dataIndex: "ppeIds",
                                    key: "ppeIds",
                                    render: (ids: string[]) =>
                                        ids.length ? ids.join(", ") : "Связей нет",
                                },
                            ]}
                        />
                    </>
                )}

                {divisions.length > 0 && (
                    <>
                        <Title level={4}>Результат обновления</Title>
                        <Table
                            rowKey="id"
                            size="small"
                            pagination={{ pageSize: 10 }}
                            columns={columns}
                            dataSource={divisions}
                        />
                    </>
                )}
            </Space>
        </Card>
    );
};

export default UpdateDivisionRelations;