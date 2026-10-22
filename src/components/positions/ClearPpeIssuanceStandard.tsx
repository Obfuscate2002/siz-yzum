
import { useState } from "react";
import PocketBase from "pocketbase";
import {
    Alert,
    Button,
    Input,
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

export function ClearPpeStandardsButton({ pb }: Props) {
    const [open, setOpen] = useState(false);
    const [confirmation, setConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("");

    const handleClear = async () => {
        if (confirmation !== "УДАЛИТЬ") {
            message.error('Для подтверждения введи слово "УДАЛИТЬ"');
            return;
        }

        setLoading(true);
        setProgress(0);
        setStatus("Получение списка записей...");

        try {
            const records = await pb
                .collection("ppe_issuance_standards")
                .getFullList<{ id: string }>({
                    fields: "id",
                });

            if (records.length === 0) {
                message.info("Коллекция уже пустая");
                setStatus("Нет записей для удаления");
                setOpen(false);
                return;
            }

            let deleted = 0;
            const errors: string[] = [];

            for (let i = 0; i < records.length; i++) {
                try {
                    await pb
                        .collection("ppe_issuance_standards")
                        .delete(records[i].id);

                    deleted++;
                } catch (error) {
                    errors.push(
                        `${records[i].id}: ${
                            error instanceof Error ? error.message : String(error)
                        }`,
                    );
                }

                setProgress(
                    Math.round(((i + 1) / records.length) * 100),
                );
                setStatus(`Удалено ${deleted} из ${records.length}`);
            }

            setStatus(
                `Завершено. Удалено: ${deleted}, ошибок: ${errors.length}`,
            );

            if (errors.length === 0) {
                message.success(`Удалено записей: ${deleted}`);
                setOpen(false);
                setConfirmation("");
            } else {
                console.error("Ошибки удаления:", errors);
                message.warning(
                    `Удалено ${deleted} из ${records.length}. Ошибок: ${errors.length}. Подробности в консоли.`,
                );
            }
        } catch (error) {
            const detail =
                error instanceof Error ? error.message : String(error);

            setStatus(`Ошибка: ${detail}`);
            message.error(detail);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                    setConfirmation("");
                    setProgress(0);
                    setStatus("");
                    setOpen(true);
                }}
                disabled={loading}
            >
                Очистить таблицу норм СИЗ
            </Button>

            <Modal
                title="Полная очистка норм СИЗ"
                open={open}
                onCancel={() => {
                    if (!loading) setOpen(false);
                }}
                onOk={handleClear}
                okText="Удалить все записи"
                cancelText="Отмена"
                okButtonProps={{
                    danger: true,
                    disabled: confirmation !== "УДАЛИТЬ" || loading,
                    loading,
                }}
                cancelButtonProps={{ disabled: loading }}
                closable={!loading}
                maskClosable={!loading}
                keyboard={!loading}
                destroyOnHidden
            >
                <Space direction="vertical" style={{ width: "100%" }}>
                    <Alert
                        type="error"
                        showIcon
                        message="Внимание! Действие необратимо"
                        description={
                            <>
                                Будут удалены все записи коллекции{" "}
                                <Text strong>ppe_issuance_standards</Text>.
                                <br />
                                Коллекция должностей <Text strong>positions</Text>{" "}
                                не изменится.
                                <br />
                                Созданные записи нельзя будет восстановить этой кнопкой.
                                Перед продолжением сделай резервную копию.
                            </>
                        }
                    />

                    <Text>Для подтверждения введи УДАЛИТЬ:</Text>

                    <Input
                        value={confirmation}
                        onChange={(e) => setConfirmation(e.target.value)}
                        placeholder="УДАЛИТЬ"
                        disabled={loading}
                    />

                    {status && <Text>{status}</Text>}

                    {loading && <Progress percent={progress} />}
                </Space>
            </Modal>
        </>
    );
}
