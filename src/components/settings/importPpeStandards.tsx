
import { useState } from "react";
import {
    Button,
    Card,
    Progress,
    Space,
    Statistic,
    Typography,
    Alert,
    Table,
    Tag,
    Popconfirm,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import updates from "../../data/ppe_issuance_period_quantity_updates.json";
import {pb} from "../../pocketbase/pocketbase.ts";

const { Title, Text } = Typography;

interface PpeUpdate {
    id: string;
    quantity: string;
    issuance_period: string;
}

interface ImportError {
    id: string;
    error: string;
}

const importData = updates as PpeUpdate[];

export const ImportPpeStandards = () => {
    const [loading, setLoading] = useState(false);
    const [finished, setFinished] = useState(false);
    const [progress, setProgress] = useState(0);
    const [success, setSuccess] = useState(0);
    const [errors, setErrors] = useState<ImportError[]>([]);

    const startImport = async () => {
        if (loading) return;

        setLoading(true);
        setFinished(false);
        setProgress(0);
        setSuccess(0);
        setErrors([]);

        let successCount = 0;
        const errorList: ImportError[] = [];

        for (let i = 0; i < importData.length; i++) {
            const item = importData[i];

            try {
                await pb
                    .collection("ppe_issuance_standards")
                    .update(item.id, {
                        quantity: item.quantity,
                        issuance_period: item.issuance_period,
                    });

                successCount++;
            } catch (error) {
                errorList.push({
                    id: item.id,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Неизвестная ошибка",
                });
            }

            setSuccess(successCount);
            setProgress(
                Math.round(((i + 1) / importData.length) * 100)
            );
            setErrors([...errorList]);
        }

        setSuccess(successCount);
        setErrors(errorList);
        setLoading(false);
        setFinished(true);

        if (errorList.length === 0) {
            message.success("Импорт успешно завершён!");
        } else {
            message.warning(
                `Импорт завершён. Ошибок: ${errorList.length}`
            );
        }
    };

    const columns: ColumnsType<ImportError> = [
        {
            title: "ID записи",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Ошибка",
            dataIndex: "error",
            key: "error",
        },
    ];

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <div>
                    <Title level={4}>Импорт норм выдачи СИЗ</Title>
                    <Text type="secondary">
                        Обновление количества и периода выдачи в PocketBase
                    </Text>
                </div>

                <Space size="large" wrap>
                    <Statistic
                        title="Всего записей"
                        value={importData.length}
                    />
                    <Statistic
                        title="Успешно обновлено"
                        value={success}
                        valueStyle={{ color: "#389e0d" }}
                    />
                    <Statistic
                        title="Ошибок"
                        value={errors.length}
                        valueStyle={{ color: errors.length ? "#cf1322" : undefined }}
                    />
                </Space>

                <Alert
                    type="info"
                    showIcon
                    message="Будут изменены только два поля"
                    description={
                        <>
                            <Tag color="blue">quantity</Tag>
                            <Tag color="blue">issuance_period</Tag>
                            Поле issuance_norm и связи записей останутся без изменений.
                        </>
                    }
                />

                <div>
                    <Progress
                        percent={progress}
                        status={finished && errors.length ? "exception" : "active"}
                    />
                    <Text type="secondary">
                        Обработано: {Math.round((progress / 100) * importData.length)}{" "}
                        из {importData.length}
                    </Text>
                </div>

                <Popconfirm
                    title="Начать импорт?"
                    description={`Будут обновлены ${importData.length} существующих записей. Старое поле issuance_norm не изменится.`}
                    onConfirm={startImport}
                    okText="Начать"
                    cancelText="Отмена"
                >
                    <Button
                        type="primary"
                        size="large"
                        block
                        loading={loading}
                        disabled={finished && errors.length === 0}
                    >
                        {finished ? "Импорт завершён" : "Импортировать данные"}
                    </Button>
                </Popconfirm>

                {finished && (
                    <Alert
                        type={errors.length ? "warning" : "success"}
                        showIcon
                        message={
                            errors.length
                                ? "Импорт завершён с ошибками"
                                : "Все записи успешно обновлены"
                        }
                        description={`Успешно: ${success}. Ошибок: ${errors.length}.`}
                    />
                )}

                {errors.length > 0 && (
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={errors}
                        pagination={{ pageSize: 10 }}
                        size="small"
                    />
                )}
            </Space>
        </Card>
    );
};
