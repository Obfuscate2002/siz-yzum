
import { useEffect, useState } from "react";
import type { Dayjs } from "dayjs";
import {
    Button,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Modal,
    Select,
    Table,
    Typography,
    message,
    Space,
    Divider,
} from "antd";
import {
    FileTextTwoTone,
    PlusOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import type { PpeIssuanceStatement } from "../types/PpeIssuanceStatement.ts";
import type { PpeIssuanceStatementItem } from "../types/PpeIssuanceStatementItem.ts";

import { getDivisions } from "../api/divisions.api.ts";
import { getEmployes } from "../api/employees.api.ts";

import {
    getWarehouseNomenclature,
} from "../api/warehouseNomenclature.api.ts";

import type {
    WarehouseNomenclature,
} from "../api/warehouseNomenclature.api.ts";
import type { Division } from "../types/divisions.ts";
import type { Employee } from "../types/employee.ts";

import {
    createPpeIssuanceStatement,
    createPpeIssuanceStatementItems,
    getPpeIssuanceStatements,
} from "../hooks/usePpeIssuanceStatements.tsx";

import {
    getPpeIssuanceStatementItems,
} from "../hooks/usePpeIssuanceStatementItems.tsx";

import {
    getPositions,
    getsPositionPpeStandards,
    type Position,
    type PpeIssuanceStandard,
} from "../api/ppePositions.api.ts";

type StatementFormValues = {
    statementNumber: string;
    statementDate: Dayjs;
    division: string;
    responsibleEmployee: string;
    basis: string;
};

type StatementItemFormValue = {
    employee: string;
    contractPosition: string;
    ppePosition: string;
    warehouse_nomenclature: string;
    quantity: number;
    unit: string;
    wearPeriod?: number;
    wearPeriodUnit?: "day" | "month" | "year";
    comment?: string;
};

type ItemsFormValues = {
    items: StatementItemFormValue[];
};

export const PagePpeIssuanceStatements = () => {
    const [statements, setStatements] = useState<PpeIssuanceStatement[]>([]);
    const [statementItems, setStatementItems] = useState<PpeIssuanceStatementItem[]>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [warehouseNomenclature, setWarehouseNomenclature] = useState<WarehouseNomenclature[]>([]);

    const [selectedDivision, setSelectedDivision] = useState<string>();
    const [selectedStatement, setSelectedStatement] =
        useState<PpeIssuanceStatement | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshingItems, setIsRefreshingItems] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingItems, setIsSavingItems] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAddItemsModalOpen, setIsAddItemsModalOpen] = useState(false);

    const [statementForm] = Form.useForm<StatementFormValues>();
    const [itemsForm] = Form.useForm<ItemsFormValues>();

    const formDivision = Form.useWatch("division", statementForm);

    const divisionEmployees = employees.filter(
        employee => employee.division === formDivision
    );

    const statementEmployees = employees.filter(
        employee => employee.division === selectedStatement?.division
    );

    // Загрузка данных
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);

            try {
                const [
                    statementsData,
                    itemsData,
                    divisionsData,
                    employeesData,
                    positionsData,
                    warehouseData,
                ] = await Promise.all([
                    getPpeIssuanceStatements(),
                    getPpeIssuanceStatementItems(),
                    getDivisions(),
                    getEmployes(),
                    getPositions(),
                    getWarehouseNomenclature(),
                ]);

                setStatements(statementsData);
                setStatementItems(itemsData);
                setDivisions(divisionsData);
                setEmployees(employeesData);
                setPositions(positionsData);
                setWarehouseNomenclature(warehouseData);
            } catch (error) {
                console.error(error);
                message.error("Ошибка загрузки данных");
            } finally {
                setIsLoading(false);
            }
        };

        void loadData();
    }, []);

    // Создание ведомости
    const handleCreateStatement = async (values: StatementFormValues) => {
        try {
            setIsSaving(true);

            const newStatement = await createPpeIssuanceStatement({
                statementNumber: values.statementNumber,
                statementDate: values.statementDate.toISOString(),
                division: values.division,
                responsibleEmployee: values.responsibleEmployee,
                basis: values.basis,
                status: "draft",
            });

            setStatements(prev => [...prev, newStatement]);
            setSelectedDivision(newStatement.division);
            setSelectedStatement(newStatement);

            setIsCreateModalOpen(false);
            statementForm.resetFields();

            message.success("Ведомость создана");
        } catch (error) {
            console.error(error);
            message.error("Не удалось создать ведомость");
        } finally {
            setIsSaving(false);
        }
    };

    // Ведомости выбранного подразделения
    const divisionStatements = statements.filter(
        statement => statement.division === selectedDivision
    );

    // Строки открытой ведомости
    const selectedStatementItems = statementItems.filter(
        item => item.statement === selectedStatement?.id
    );

    // Сохранение строк ведомости
    const handleAddStatementItems = async (values: ItemsFormValues) => {
        if (!selectedStatement) {
            message.error("Сначала откройте ведомость");
            return;
        }

        try {
            setIsSavingItems(true);

            const itemsToSave = values.items.map(item => ({
                statement: selectedStatement.id,
                employee: item.employee,
                nomenclature: item.warehouse_nomenclature,
                warehouse_nomenclature: item.warehouse_nomenclature,
                quantity: item.quantity,
                unit: item.unit,
                contractPosition: item.contractPosition,
                wearPeriod: item.wearPeriod,
                wearPeriodUnit: item.wearPeriodUnit,
                comment: item.comment,
            }));

            // Сохраняем позиции в PocketBase
            await createPpeIssuanceStatementItems(itemsToSave);

            // Обновляем данные таблицы после сохранения
            setIsRefreshingItems(true);

            const updatedItems = await getPpeIssuanceStatementItems();
            setStatementItems(updatedItems);

            itemsForm.resetFields();
            setIsAddItemsModalOpen(false);

            message.success("Позиции добавлены в ведомость");
        } catch (error: any) {
            console.error("Ошибка сохранения позиций:", error);
            console.error("Ответ PocketBase:", error?.data);

            message.error(
                error?.data?.data?.contractPosition?.message ??
                error?.message ??
                "Не удалось добавить позиции"
            );
        } finally {
            setIsSavingItems(false);
            setIsRefreshingItems(false);
        }
    };

    // Колонки ведомостей
    const statementColumns: ColumnsType<PpeIssuanceStatement> = [
        {
            title: "Номер ведомости",
            dataIndex: "statementNumber",
            key: "statementNumber",
        },
        {
            title: "Дата",
            dataIndex: "statementDate",
            key: "statementDate",
            render: (date: string) =>
                date ? new Date(date).toLocaleDateString("ru-RU") : "-",
        },
        {
            title: "Ответственный",
            dataIndex: "responsibleEmployee",
            key: "responsibleEmployee",
            render: (id: string) =>
                employees.find(employee => employee.id === id)?.fullName ?? "-",
        },
        {
            title: "Статус",
            dataIndex: "status",
            key: "status",
        },
        {
            title: "Действия",
            key: "actions",
            render: (_: unknown, record) => (
                <Button
                    type="link"
                    onClick={() => setSelectedStatement(record)}
                >
                    Открыть
                </Button>
            ),
        },
    ];

    // Колонки строк ведомости
    const itemColumns: ColumnsType<PpeIssuanceStatementItem> = [
        {
            title: "Сотрудник",
            key: "employee",
            render: (_: unknown, record) =>
                record.expand?.employee?.fullName ?? "-",
        },
        {
            title: "Табельный номер",
            key: "personnelNumber",
            render: (_: unknown, record) =>
                record.expand?.employee?.personnelNumber ?? "-",
        },
        {
            title: "Должность по трудовому",
            key: "contractPosition",
            render: (_: unknown, record) =>
                record.expand?.contractPosition?.name ?? "-",
        },
        {
            title: "СИЗ",
            key: "warehouse_nomenclature",
            render: (_: unknown, record) =>
                record.expand?.warehouse_nomenclature?.name ?? "-",
        },
        {
            title: "Количество",
            dataIndex: "quantity",
            key: "quantity",
        },
        {
            title: "Ед. изм.",
            dataIndex: "unit",
            key: "unit",
        },
        {
            title: "Срок носки",
            dataIndex: "wearPeriod",
            key: "wearPeriod",
            render: (value?: number) => value ?? "-",
        },
        {
            title: "Ед. срока",
            dataIndex: "wearPeriodUnit",
            key: "wearPeriodUnit",
            render: (unit?: string) => {
                const units: Record<string, string> = {
                    day: "день",
                    month: "месяц",
                    year: "год",
                };

                return unit ? units[unit] ?? unit : "-";
            },
        },
    ];

    return (
        <>
            <Typography.Title level={2}>
                <FileTextTwoTone /> Ведомости выдачи СИЗ
            </Typography.Title>

            {/* Выбор подразделения */}
            <div className="mb-5">
                <Typography.Title level={4}>
                    Подразделение
                </Typography.Title>

                <Space wrap className="w-full">
                    <Select
                        className="min-w-64"
                        placeholder="Выберите подразделение"
                        value={selectedDivision}
                        onChange={value => {
                            setSelectedDivision(value);
                            setSelectedStatement(null);
                        }}
                        options={divisions.map(division => ({
                            value: division.id,
                            label: division.name,
                        }))}
                    />

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Создать ведомость
                    </Button>
                </Space>
            </div>

            {/* Список ведомостей */}
            {selectedDivision && !selectedStatement && (
                <Table
                    rowKey="id"
                    loading={isLoading}
                    dataSource={divisionStatements}
                    columns={statementColumns}
                    pagination={{ pageSize: 10 }}
                />
            )}

            {/* Открытая ведомость */}
            {selectedStatement && (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap justify-between items-center gap-3">
                        <Typography.Title level={3}>
                            Ведомость № {selectedStatement.statementNumber}
                        </Typography.Title>

                        <Space wrap>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    itemsForm.setFieldsValue({
                                        items: [
                                            {
                                                quantity: 1,
                                            } as StatementItemFormValue,
                                        ],
                                    });
                                    setIsAddItemsModalOpen(true);
                                }}
                            >
                                Добавить сотрудников и СИЗ
                            </Button>

                            <Button onClick={() => setSelectedStatement(null)}>
                                Назад к списку
                            </Button>
                        </Space>
                    </div>

                    <div className="bg-blue-300/20 p-4 rounded-lg">
                        <p>
                            <strong>Дата:</strong>{" "}
                            {new Date(selectedStatement.statementDate)
                                .toLocaleDateString("ru-RU")}
                        </p>

                        <p>
                            <strong>Подразделение:</strong>{" "}
                            {divisions.find(
                                division => division.id === selectedStatement.division
                            )?.name ?? "-"}
                        </p>

                        <p>
                            <strong>Ответственный:</strong>{" "}
                            {employees.find(
                                employee =>
                                    employee.id === selectedStatement.responsibleEmployee
                            )?.fullName ?? "-"}
                        </p>

                        <p>
                            <strong>Основание:</strong>{" "}
                            {selectedStatement.basis || "-"}
                        </p>
                    </div>

                    <Table
                        rowKey="id"
                        loading={isLoading || isRefreshingItems}
                        dataSource={selectedStatementItems}
                        columns={itemColumns}
                        pagination={{ pageSize: 10 }}
                        locale={{ emptyText: "В ведомости пока нет сотрудников" }}
                    />
                </div>
            )}

            {/* Создание ведомости */}
            <Modal
                title="Создание ведомости"
                open={isCreateModalOpen}
                onCancel={() => {
                    setIsCreateModalOpen(false);
                    statementForm.resetFields();
                }}
                footer={null}
                destroyOnHidden
            >
                <Form
                    form={statementForm}
                    layout="vertical"
                    onFinish={handleCreateStatement}
                >
                    <Form.Item
                        label="Номер ведомости"
                        name="statementNumber"
                        rules={[{ required: true, message: "Введите номер ведомости" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Дата ведомости"
                        name="statementDate"
                        rules={[{ required: true, message: "Выберите дату" }]}
                    >
                        <DatePicker className="w-full" format="DD.MM.YYYY" />
                    </Form.Item>

                    <Form.Item
                        label="Подразделение"
                        name="division"
                        rules={[{ required: true, message: "Выберите подразделение" }]}
                    >
                        <Select
                            options={divisions.map(division => ({
                                value: division.id,
                                label: division.name,
                            }))}
                            onChange={() => {
                                statementForm.setFieldValue(
                                    "responsibleEmployee",
                                    undefined
                                );
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Ответственный"
                        name="responsibleEmployee"
                        rules={[{ required: true, message: "Выберите ответственного" }]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="label"
                            disabled={!formDivision}
                            options={divisionEmployees.map(employee => ({
                                value: employee.id,
                                label: employee.fullName,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Основание"
                        name="basis"
                        rules={[{ required: true, message: "Укажите основание" }]}
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isSaving}
                        block
                    >
                        Создать ведомость
                    </Button>
                </Form>
            </Modal>

            {/* Добавление сотрудников и СИЗ */}
            <Modal
                title="Добавление сотрудников и СИЗ"
                open={isAddItemsModalOpen}
                onCancel={() => {
                    setIsAddItemsModalOpen(false);
                    itemsForm.resetFields();
                }}
                footer={null}
                width={900}
                destroyOnHidden
            >
                <Form
                    form={itemsForm}
                    layout="vertical"
                    onFinish={handleAddStatementItems}
                >
                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <div
                                        key={key}
                                        className="border rounded-lg p-4 mb-4"
                                    >
                                        <div className="flex justify-between items-center">
                                            <Typography.Title level={5}>
                                                Позиция {name + 1}
                                            </Typography.Title>

                                            <Button
                                                danger
                                                type="text"
                                                icon={<DeleteOutlined />}
                                                onClick={() => remove(name)}
                                            >
                                                Удалить
                                            </Button>
                                        </div>

                                        <Form.Item
                                            {...restField}
                                            label="Сотрудник"
                                            name={[name, "employee"]}
                                            rules={[
                                                { required: true, message: "Выберите сотрудника" },
                                            ]}
                                        >
                                            <Select
                                                showSearch
                                                optionFilterProp="label"
                                                options={statementEmployees.map(employee => ({
                                                    value: employee.id,
                                                    label: `${employee.fullName} (${employee.personnelNumber})`,
                                                }))}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Должность по трудовому договору"
                                            name={[name, "contractPosition"]}
                                            rules={[
                                                { required: true, message: "Выберите должность" },
                                            ]}
                                        >
                                            <Select
                                                showSearch
                                                optionFilterProp="label"
                                                options={
                                                    divisions
                                                        .find(division => division.id === selectedStatement?.division)
                                                        ?.expand?.contract_positions?.map(position => ({
                                                        value: position.id,
                                                        label: position.name,
                                                    })) ?? []
                                                }
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            label="Должность по СИЗ"
                                            name={[name, "ppePosition"]}
                                            rules={[
                                                { required: true, message: "Выберите должность по СИЗ" },
                                            ]}
                                        >
                                            <Select
                                                showSearch
                                                optionFilterProp="label"
                                                options={positions.map(position => ({
                                                    value: position.id,
                                                    label: position.name,
                                                }))}
                                                onChange={async value => {
                                                    try {
                                                        const standards =
                                                            await getsPositionPpeStandards(value);

                                                        const standard = standards[0];

                                                        if (standard) {
                                                            itemsForm.setFieldValue(
                                                                ["items", name, "comment"],
                                                                `Норма: ${standard.issuance_norm}. Основание: ${standard.issuance_basis}`
                                                            );
                                                        } else {
                                                            itemsForm.setFieldValue(
                                                                ["items", name, "comment"],
                                                                ""
                                                            );
                                                        }
                                                    } catch (error) {
                                                        console.error(error);
                                                        message.error("Не удалось загрузить нормы СИЗ");
                                                    }
                                                }}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            noStyle
                                            shouldUpdate={(prev, current) =>
                                                prev.items?.[name]?.ppePosition !==
                                                current.items?.[name]?.ppePosition
                                            }
                                        >
                                            {({ getFieldValue }) => {
                                                const ppePosition = getFieldValue([
                                                    "items",
                                                    name,
                                                    "ppePosition",
                                                ]);

                                                return ppePosition ? (
                                                    <PpeStandardsInfo
                                                        positionId={ppePosition}
                                                    />
                                                ) : null;
                                            }}
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            label="СИЗ со склада"
                                            name={[name, "warehouse_nomenclature"]}
                                            rules={[
                                                { required: true, message: "Выберите СИЗ" },
                                            ]}
                                        >
                                            <Select
                                                showSearch
                                                optionFilterProp="label"
                                                options={warehouseNomenclature.map(item => ({
                                                    value: item.id,
                                                    label: `${item.name} (${item.productCode})`,
                                                }))}
                                                onChange={value => {
                                                    const selected =
                                                        warehouseNomenclature.find(
                                                            item => item.id === value
                                                        );

                                                    if (selected) {
                                                        itemsForm.setFieldValue(
                                                            ["items", name, "unit"],
                                                            selected.unit
                                                        );
                                                    }
                                                }}
                                            />
                                        </Form.Item>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Form.Item
                                                {...restField}
                                                label="Количество"
                                                name={[name, "quantity"]}
                                                rules={[
                                                    { required: true, message: "Укажите количество" },
                                                ]}
                                            >
                                                <InputNumber
                                                    min={1}
                                                    className="w-full"
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                label="Единица измерения"
                                                name={[name, "unit"]}
                                                rules={[
                                                    { required: true, message: "Укажите единицу" },
                                                ]}
                                            >
                                                <Input />
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                label="Срок носки"
                                                name={[name, "wearPeriod"]}
                                            >
                                                <InputNumber
                                                    min={1}
                                                    className="w-full"
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                label="Единица срока"
                                                name={[name, "wearPeriodUnit"]}
                                            >
                                                <Select
                                                    allowClear
                                                    options={[
                                                        { value: "day", label: "Дни" },
                                                        { value: "month", label: "Месяцы" },
                                                        { value: "year", label: "Годы" },
                                                    ]}
                                                />
                                            </Form.Item>
                                        </div>

                                        <Form.Item
                                            {...restField}
                                            label="Комментарий"
                                            name={[name, "comment"]}
                                        >
                                            <Input.TextArea rows={2} />
                                        </Form.Item>
                                    </div>
                                ))}

                                <Button
                                    type="dashed"
                                    block
                                    icon={<PlusOutlined />}
                                    onClick={() => add({ quantity: 1 })}
                                >
                                    Добавить ещё позицию
                                </Button>
                            </>
                        )}
                    </Form.List>

                    <Divider />

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isSavingItems}
                        block
                    >
                        Сохранить позиции
                    </Button>
                </Form>
            </Modal>
        </>
    );
};

// Информация о нормах выбранной должности
const PpeStandardsInfo = ({ positionId }: { positionId: string }) => {
    const [standards, setStandards] = useState<PpeIssuanceStandard[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let active = true;

        const load = async () => {
            setLoading(true);

            try {
                const data = await getsPositionPpeStandards(positionId);

                if (active) {
                    setStandards(data);
                }
            } catch (error) {
                console.error(error);

                if (active) {
                    message.error("Не удалось загрузить нормы для должности");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, [positionId]);

    if (loading) {
        return (
            <Typography.Text type="secondary">
                Загрузка норм СИЗ...
            </Typography.Text>
        );
    }

    if (standards.length === 0) {
        return (
            <Typography.Text type="secondary">
                Для выбранной должности нормы не найдены
            </Typography.Text>
        );
    }

    return (
        <div className="bg-gray-100 rounded p-3 mb-4">
            <Typography.Text strong>
                Нормы выдачи для должности:
            </Typography.Text>

            {standards.map(standard => (
                <div key={standard.id} className="mt-2">
                    <Typography.Text>
                        {standard.ppe_name} — {standard.issuance_norm}
                    </Typography.Text>

                    {standard.issuance_basis && (
                        <div>
                            <Typography.Text type="secondary">
                                Основание: {standard.issuance_basis}
                            </Typography.Text>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
