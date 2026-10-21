
import {
    Button,
    Col,
    Drawer,
    type DrawerProps,
    Flex,
    Form, type FormInstance,
    type GetProp,
    Input,
    message,
    Row,
    Typography
} from "antd";
import Text from "antd/es/typography/Text";
import type {PpeIssuanceStandard} from "../../types/ppeIssuanceStandards.ts";
import {EditOutlined} from "@ant-design/icons";
import {createStaticStyles} from "antd-style";
import {useEffect, useState } from "react";
import { useForm } from "antd/es/form/Form";
import {pb} from "../../pocketbase/pocketbase.ts";


type HeaderTextProps = {
    ppeIssuanceStandard: PpeIssuanceStandard | undefined;
    isEditing: boolean;
}

const headerText = ({ppeIssuanceStandard, isEditing}: HeaderTextProps ) => {
    return (
        <div className={'flex flex-col'}>
            <Row>
                <Col span={20}>
                    <Typography.Title level={1}>{ppeIssuanceStandard?.position_name}</Typography.Title>
                </Col>
                <Col span={4} className={'flex justify-center items-center p-1'}>
                    {isEditing ? (
                        <Text className={'border border-cyan-600 p-1 rounded-lg text-cyan-600'}>Редактирование</Text>
                        ) : (
                        <Text type={'secondary'} className={'border border-gray-300 p-1 rounded-lg'}>Просмотр</Text>
                    )}
                </Col>
            </Row>
        </div>
    )
}

type SharedContentProps = {
    form: FormInstance;
    isEditing: boolean;
    record: PpeIssuanceStandard | undefined;
    saving: boolean;
    handleSave: (values: any) => void;
    handleClick: () => void;
    handleCloseEdit: () => void;
};

const sharedContent = ({
                           form,
                           record,
                           isEditing,
                           saving,
                           handleSave,
                           handleClick,
                           handleCloseEdit,}: SharedContentProps) => {
    return (
        <>
            {isEditing ? (
                <>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSave}
                        disabled={saving}
                    >
                        <Form.Item label="Тип СИЗ" name="ppe_type">
                            <Input />
                        </Form.Item>

                        <Form.Item label="Наименование СИЗ" name="ppe_name">
                            <Input />
                        </Form.Item>

                        <Form.Item label="Нормы выдачи" name="issuance_norm">
                            <Input.TextArea rows={3} />
                        </Form.Item>

                        <Form.Item
                            label="Основание выдачи СИЗ"
                            name="issuance_basis"
                        >
                            <Input.TextArea rows={3} />
                        </Form.Item>
                    </Form>

                    <Flex gap="small">
                        <Button onClick={handleCloseEdit} disabled={saving}>
                            Отмена
                        </Button>

                        <Button
                            type="primary"
                            loading={saving}
                            onClick={() => form.submit()}
                        >
                            Сохранить
                        </Button>
                    </Flex>
                </>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Text strong>Тип СИЗ:</Text>
                            <div>{record?.ppe_type || "—"}</div>
                        </div>

                        <div>
                            <Text strong>Наименование СИЗ:</Text>
                            <div>{record?.ppe_name || "—"}</div>
                        </div>

                        <div>
                            <Text strong>Нормы выдачи:</Text>
                            <div>{record?.issuance_norm || "—"}</div>
                        </div>

                        <div>
                            <Text strong>Основание выдачи СИЗ:</Text>
                            <div>{record?.issuance_basis || "—"}</div>
                        </div>
                    </div>

                    <Button
                        type="primary"
                        onClick={handleClick}
                        icon={<EditOutlined />}
                    >
                        Редактировать
                    </Button>
                </>
            )}
        </>
    );
}

const classNames = createStaticStyles(
    ({ css }): NonNullable<GetProp<DrawerProps, 'classNames', 'Return'>> => ({
        root: css`
      border-radius: 10px;
      padding: 10px;
    `,
    }),
);


const stylesFn: DrawerProps['styles'] = (info): GetProp<DrawerProps, 'styles', 'Return'> => {
    if (info.props.footer) {
        return {
            header: {
                padding: 16,
            },
            body: {
                padding: 16,
            },
            footer: {
                padding: '16px 10px',
                backgroundColor: '#fafafa',
            },
        };
    }
};

type SelectProp = {
    selectedPpeIssuanceStandardId: string | null;
    onClose: () => void;
    ppeIssuanceStandard: PpeIssuanceStandard | undefined;
}

export const PpeIssuanceStandardRecord = ({selectedPpeIssuanceStandardId, ppeIssuanceStandard, onClose}: SelectProp) => {

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [record, setRecord] = useState<PpeIssuanceStandard | undefined>(
        ppeIssuanceStandard
    );
    const [loading, setLoading] = useState(false);
    const [form] = useForm()

    const handleClick = () => {
        form.setFieldsValue({
            ppe_type: record?.ppe_type ?? "",
            ppe_name: record?.ppe_name ?? "",
            issuance_norm: record?.issuance_norm ?? "",
            issuance_basis: record?.issuance_basis ?? "",
        });

        setIsEditing(true);
    }
    const handleCloseEdit = () => {
        form.resetFields();
        setIsEditing(false);
    }


    const handleSave = async (values: {
        ppe_type: string;
        ppe_name: string;
        issuance_norm: string;
        issuance_basis: string;
    }) => {
        if (!selectedPpeIssuanceStandardId) return;

        try {
            setSaving(true);

            const updatedRecord =
                await pb
                    .collection("ppe_issuance_standards")
                    .update<PpeIssuanceStandard>(
                        selectedPpeIssuanceStandardId,
                        values
                    );

            setRecord(updatedRecord);
            setIsEditing(false);

            message.success("Изменения сохранены");
        } catch (error) {
            console.error("Ошибка сохранения записи:", error);
            message.error("Ошибка при сохранении изменений");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!selectedPpeIssuanceStandardId) {
            setRecord(undefined);
            return;
        }

        const loadRecord = async () => {
            try {
                setLoading(true);

                const data = await pb
                    .collection("ppe_issuance_standards")
                    .getOne<PpeIssuanceStandard>(
                        selectedPpeIssuanceStandardId,
                    );

                setRecord(data);
            } catch (error) {
                console.error("Ошибка загрузки записи:", error);
                message.error("Не удалось загрузить данные");
            } finally {
                setLoading(false);
            }
        };

        void loadRecord();
    }, [selectedPpeIssuanceStandardId]);

    const sharedProps: DrawerProps = {
        classNames,
        size: 800,
    };

    const footer: React.ReactNode = (
        <Flex gap="medium" justify="flex-end">
            <Button
                styles={{ root: { borderColor: '#ccc', color: '#171717', backgroundColor: '#fff' } }}
                onClick={onClose}
            >
                Cancel
            </Button>
            <Button
                type="primary"
                styles={{ root: { backgroundColor: '#171717' } }}
            >
                Submit
            </Button>
        </Flex>
    );


    return (
        <>
            <Drawer
                {...sharedProps}
                footer={footer}
                title={headerText({
                    ppeIssuanceStandard: record,
                    isEditing,
                })}
                styles={stylesFn}
                mask={{ enabled: true, blur: true }}
                open={selectedPpeIssuanceStandardId !== null}
                onClose={onClose}
                closable={false}
            >
                {loading ? (
                    <div>Загрузка...</div>
                ) : (
                    sharedContent({
                    form,
                    record,
                    isEditing,
                    saving,
                    handleSave,
                    handleClick,
                    handleCloseEdit,
                }))}
            </Drawer>
        </>
    )
}