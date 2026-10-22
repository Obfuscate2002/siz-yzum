
import { useState } from "react";
import PocketBase from "pocketbase";
import {
    Alert,
    Button,
    Modal,
    Progress,
    Space,
    Typography,
    message,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

type Props = {
    pb: PocketBase;
};

type Standard = {
    id: string;
    ppe_type?: string;
    ppe_name?: string;
    issuance_norm?: string;
    issuance_basis?: string;
    position_name?: string;
    position?: string;
};

const clean = (value: unknown) =>
    String(value ?? "")
        .replace(/\u00A0/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLocaleLowerCase("ru-RU");

const duplicateKey = (row: Standard) =>
    JSON.stringify([
        clean(row.position),
        clean(row.ppe_type),
        clean(row.ppe_name),
        clean(row.issuance_norm),
        clean(row.issuance_basis),
    ]);

export function RemovePpeDuplicatesButton({ pb }: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState<Standard[]>([]);
    const [duplicateIds, setDuplicateIds] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("");

    const findDuplicates = async () => {
        setLoading(true);
        setStatus("Проверяем записи PocketBase...");

        try {
            const all = await pb
                .collection("ppe_issuance_standards")
                .getFullList<Standard>({
                    fields:
                        "id,ppe_type,ppe_name,issuance_norm,issuance_basis,position_name,position",
                });

            const seen = new Set<string>();
            const duplicates: string[] = [];

            for (const row of all) {
                // Не объединяем записи без должности или ключевого содержания:
                // такие записи требуют ручной проверки.
                if (
                    !clean(row.position) ||
                    !clean(row.ppe_type) ||
                    !clean(row.ppe_name) ||
                    !clean(row.issuance_norm) ||
                    !clean(row.issuance_basis)
                ) {
                    continue;
                }

                const key = duplicateKey(row);

                if (seen.has(key)) {
                    duplicates.push(row.id);
                } else {
                    seen.add(key);
                }
            }

            setRecords(all);
            setDuplicateIds(duplicates);
            setProgress(0);
            setStatus("");

            if (duplicates.length === 0) {
                message.success("Дубли не найдены");
                setOpen(false);
            } else {
                setOpen(true);
            }
        } catch (error) {
            message.error(
                error instanceof Error
                    ? error.message
                    : "Не удалось проверить записи",
            );
        } finally {
            setLoading(false);
        }
    };

    const removeDuplicates = async () => {
        setLoading(true);
        setProgress(0);

        let deleted = 0;
        const failed: string[] = [];

        try {
            for (let i = 0; i < duplicateIds.length; i++) {
                const id = duplicateIds[i];

                try {
                    await pb
                        .collection("ppe_issuance_standards")
                        .delete(id);
                    deleted++;
                } catch (error) {
                    failed.push(
                        `${id}: ${
                            error instanceof Error ? error.message : String(error)
                        }`,
                    );
                }

                setProgress(
                    Math.round(((i + 1) / duplicateIds.length) * 100),
                );
                setStatus(`Удалено ${deleted} из ${duplicateIds.length}`);
            }

            if (failed.length > 0) {
                console.error("Не удалось удалить:", failed);
                message.warning(
                    `Удалено ${deleted}. Ошибок удаления: ${failed.length}. Подробности в консоли.`,
                );
            } else {
                message.success(`Удалено дублей: ${deleted}`);
                setOpen(false);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                danger
                icon={<DeleteOutlined />}
                loading={loading}
                onClick={findDuplicates}
            >
                Найти и убрать дубли
            </Button>

            <Modal
                title="Удаление дублирующихся норм СИЗ"
                open={open}
                onCancel={() => {
                    if (!loading) setOpen(false);
                }}
                onOk={removeDuplicates}
                okText="Удалить дубли"
                cancelText="Отмена"
                okButtonProps={{
                    danger: true,
                    disabled: duplicateIds.length === 0 || loading,
                    loading,
                }}
                cancelButtonProps={{ disabled: loading }}
                closable={!loading}
                maskClosable={!loading}
            >
                <Space direction="vertical" style={{ width: "100%" }}>
                    <Alert
                        type="warning"
                        showIcon
                        message={`Найдено дублей: ${duplicateIds.length}`}
                        description="Будут удалены повторные записи, первая запись каждой группы останется. Перед удалением рекомендуется сделать резервную копию."
                    />

                    <Text type="secondary">
                        Проверено записей: {records.length}
                    </Text>

                    {status && <Text>{status}</Text>}

                    {loading && <Progress percent={progress} />}
                </Space>
            </Modal>
        </>
    );
}
