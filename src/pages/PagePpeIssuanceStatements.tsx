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
    Spin,
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
    type WarehouseNomenclature,
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
import {PpeIssuanceStatementPrint} from "../components/ppeIssuanceStatementPrint/PpeIssuanceStatementPrint.tsx";

// --------------------------------------------------
// Типы форм
// --------------------------------------------------

type StatementFormValues = {
    statementNumber: string;
    statementDate: Dayjs;
    division: string;
    employee: string;
};

type StatementItemFormValue = {
    nomenclature: string;
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

// --------------------------------------------------
// Вспомогательные функции
// --------------------------------------------------

// Перевод срока из поля issuance_period в месяцы.
// Например: "1 год" -> 12, "1 месяц" -> 1.
const getWearPeriodInMonths = (
    issuancePeriod?: string
): number | undefined => {
    if (!issuancePeriod) return undefined;

    const value = issuancePeriod.toLowerCase().trim();

    const numberMatch = value.match(/\d+/);
    const amount = numberMatch ? Number(numberMatch[0]) : 1;

    if (/год|лет/.test(value)) {
        return amount * 12;
    }

    if (/месяц/.test(value)) {
        return amount;
    }

    if (/недел/.test(value)) {
        return undefined;
    }

    if (/дн|сут/.test(value)) {
        return undefined;
    }

    return undefined;
};

// --------------------------------------------------
// Основной компонент
// --------------------------------------------------

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

    const [standards, setStandards] = useState<PpeIssuanceStandard[]>([]);
    const [isLoadingStandards, setIsLoadingStandards] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshingItems, setIsRefreshingItems] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingItems, setIsSavingItems] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAddItemsModalOpen, setIsAddItemsModalOpen] = useState(false);

    const [statementForm] = Form.useForm<StatementFormValues>();
    const [itemsForm] = Form.useForm<ItemsFormValues>();

    const formDivision = Form.useWatch("division", statementForm);
    const formEmployee = Form.useWatch("employee", statementForm);

    // Сотрудники выбранного подразделения
    const divisionEmployees = employees.filter(
        employee => employee.division === formDivision
    );

    // Сотрудник, на которого открыта ведомость
    const selectedEmployee = employees.find(
        employee => employee.id === selectedStatement?.employee
    );

    // Ведомости выбранного подразделения
    const divisionStatements = statements.filter(
        statement => statement.division === selectedDivision
    );

    // Строки открытой ведомости
    const selectedStatementItems = statementItems.filter(
        item => item.statement === selectedStatement?.id
    );

    // --------------------------------------------------
    // Загрузка данных
    // --------------------------------------------------

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

    // --------------------------------------------------
    // Создание ведомости на сотрудника
    // --------------------------------------------------

    const handleCreateStatement = async (values: StatementFormValues) => {
        try {
            setIsSaving(true);

            const newStatement = await createPpeIssuanceStatement({
                statementNumber: values.statementNumber,
                statementDate: values.statementDate.toISOString(),
                division: values.division,
                employee: values.employee,
                status: "draft",
            });

            setStatements(prev => [...prev, newStatement]);
            setSelectedDivision(newStatement.division);
            setSelectedStatement(newStatement);

            setIsCreateModalOpen(false);
            statementForm.resetFields();

            message.success("Ведомость создана");
        } catch (error: any) {
            console.error("Ошибка создания ведомости:", error);
            console.error("Ответ PocketBase:", error?.data);

            message.error(
                error?.data?.data?.employee?.message ??
                error?.message ??
                "Не удалось создать ведомость"
            );
        } finally {
            setIsSaving(false);
        }
    };

    // --------------------------------------------------
    // Открытие формы добавления норм СИЗ
    // --------------------------------------------------

    const openAddItemsModal = async () => {
        if (!selectedEmployee) {
            message.error("Не удалось определить сотрудника ведомости");
            return;
        }

        const ppePositionId = selectedEmployee.positionRelation;

        if (!ppePositionId) {
            message.warning("У сотрудника не указана должность по СИЗ");
            return;
        }

        setIsAddItemsModalOpen(true);
        setIsLoadingStandards(true);
        setStandards([]);

        try {
            const data = await getsPositionPpeStandards(ppePositionId);

            setStandards(data);

            if (data.length === 0) {
                itemsForm.setFieldsValue({ items: [] });
                message.info("Для должности сотрудника нормы СИЗ не найдены");
                return;
            }

            const initialItems: StatementItemFormValue[] = data.map(standard => {
                const wearPeriod = getWearPeriodInMonths(
                    standard.issuance_period
                );

                return {
                    nomenclature: standard.ppe_name,
                    warehouse_nomenclature: "",
                    quantity: 1,
                    unit: "",
                    wearPeriod,
                    wearPeriodUnit: wearPeriod ? "month" : undefined,
                    comment: [
                        standard.issuance_norm
                            ? `Норма: ${standard.issuance_norm}`
                            : "",
                        standard.issuance_basis
                            ? `Основание нормы: ${standard.issuance_basis}`
                            : "",
                    ]
                        .filter(Boolean)
                        .join(". "),
                };
            });

            itemsForm.setFieldsValue({
                items: initialItems,
            });
        } catch (error) {
            console.error(error);
            message.error("Не удалось загрузить нормы СИЗ");
        } finally {
            setIsLoadingStandards(false);
        }
    };

    // --------------------------------------------------
    // Сохранение строк ведомости
    // --------------------------------------------------

    const handleAddStatementItems = async (values: ItemsFormValues) => {
        if (!selectedStatement || !selectedEmployee) {
            message.error("Не удалось определить ведомость или сотрудника");
            return;
        }

        if (!values.items?.length) {
            message.warning("Добавьте хотя бы одну позицию");
            return;
        }

        try {
            setIsSavingItems(true);

            const itemsToSave = values.items.map(item => ({
                statement: selectedStatement.id,
                employee: selectedEmployee.id,

                // Наименование из нормы СИЗ
                nomenclature: item.nomenclature,

                // Выбранная номенклатура складского учёта
                warehouse_nomenclature: item.warehouse_nomenclature,

                quantity: item.quantity,
                unit: item.unit,

                // Должность по трудовому договору сотрудника
                contractPosition: selectedEmployee.contractPosition,

                wearPeriod: item.wearPeriod,
                wearPeriodUnit: item.wearPeriodUnit,
                comment: item.comment,
            }));
            console.log(
                "Все данные для сохранения ведомости:",
                JSON.stringify(itemsToSave, null, 2)
            );
            await createPpeIssuanceStatementItems(itemsToSave);

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
                error?.data?.data?.warehouse_nomenclature?.message ??
                error?.message ??
                "Не удалось добавить позиции"
            );
        } finally {
            setIsSavingItems(false);
            setIsRefreshingItems(false);
        }
    };

    // --------------------------------------------------
    // Колонки ведомостей
    // --------------------------------------------------

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
            title: "Сотрудник",
            key: "employee",
            render: (_: unknown, record) => {
                const employee = employees.find(
                    item => item.id === record.employee
                );

                return employee?.fullName ?? record.expand?.employee?.fullName ?? "-";
            },
        },
        {
            title: "Табельный номер",
            key: "personnelNumber",
            render: (_: unknown, record) => {
                const employee = employees.find(
                    item => item.id === record.employee
                );

                return employee?.personnelNumber ??
                    record.expand?.employee?.personnelNumber ??
                    "-";
            },
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

    // --------------------------------------------------
    // Колонки строк ведомости
    // --------------------------------------------------

    const itemColumns: ColumnsType<PpeIssuanceStatementItem> = [
        {
            title: "Номенклатура по нормам СИЗ",
            dataIndex: "nomenclature",
            key: "nomenclature",
            render: (value: string) => value?.trim() || "—",
        },
        {
            title: "Номенклатура складского учёта",
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

    // --------------------------------------------------
    // Должности сотрудника
    // --------------------------------------------------

    const contractPositionName =
        selectedEmployee?.expand?.contractPosition?.name ??
        divisions
            .find(division => division.id === selectedStatement?.division)
            ?.expand?.contract_positions
            ?.find(position => position.id === selectedEmployee?.contractPosition)
            ?.name ??
        "-";

    const ppePositionName =
        selectedEmployee?.expand?.positionRelation?.name ??
        positions.find(
            position => position.id === selectedEmployee?.positionRelation
        )?.name ??
        "-";

    // --------------------------------------------------
    // Интерфейс
    // --------------------------------------------------

    return (
        <>
            <Typography.Title level={2}>
                <FileTextTwoTone /> Ведомости выдачи СИЗ по сотрудникам
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
                        onClick={() => {
                            statementForm.resetFields();
                            setIsCreateModalOpen(true);
                        }}
                    >
                        Создать ведомость
                    </Button>
                </Space>
            </div>

            {/* Список ведомостей подразделения */}
            {selectedDivision && !selectedStatement && (
                <Table
                    rowKey="id"
                    loading={isLoading}
                    dataSource={divisionStatements}
                    columns={statementColumns}
                    pagination={{ pageSize: 10 }}
                    locale={{
                        emptyText: "В выбранном подразделении ведомостей пока нет",
                    }}
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
                                icon={<FileTextTwoTone />}
                                onClick={() => window.print()}
                            >
                                Печать ведомости
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => void openAddItemsModal()}
                            >
                                Добавить нормы СИЗ
                            </Button>

                            <Button onClick={() => setSelectedStatement(null)}>
                                Назад к списку
                            </Button>
                        </Space>
                    </div>

                    <div className="bg-blue-300/20 p-4 rounded-lg">
                        <p>
                            <strong>Дата ведомости:</strong>{" "}
                            {new Date(selectedStatement.statementDate)
                                .toLocaleDateString("ru-RU")}
                        </p>

                        <p>
                            <strong>Подразделение:</strong>{" "}
                            {divisions.find(
                                division => division.id === selectedStatement.division
                            )?.name ?? "-"}
                        </p>

                        <Divider className="my-3" />

                        <p>
                            <strong>Сотрудник:</strong>{" "}
                            {selectedEmployee?.fullName ??
                                selectedStatement.expand?.employee?.fullName ??
                                "-"}
                        </p>

                        <p>
                            <strong>Табельный номер:</strong>{" "}
                            {selectedEmployee?.personnelNumber ??
                                selectedStatement.expand?.employee?.personnelNumber ??
                                "-"}
                        </p>

                        <p>
                            <strong>Должность по трудовому договору:</strong>{" "}
                            {contractPositionName}
                        </p>

                        <p>
                            <strong>Должность по СИЗ:</strong>{" "}
                            {ppePositionName}
                        </p>
                    </div>

                    <Table
                        rowKey="id"
                        loading={isLoading || isRefreshingItems}
                        dataSource={selectedStatementItems}
                        columns={itemColumns}
                        pagination={{ pageSize: 10 }}
                        locale={{
                            emptyText: "В ведомости пока нет позиций СИЗ",
                        }}
                    />
                </div>
            )}

            {/* Создание ведомости */}
            <Modal
                title="Создание ведомости на сотрудника"
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
                        rules={[
                            {
                                required: true,
                                message: "Введите номер ведомости",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Дата ведомости"
                        name="statementDate"
                        rules={[
                            {
                                required: true,
                                message: "Выберите дату",
                            },
                        ]}
                    >
                        <DatePicker
                            className="w-full"
                            format="DD.MM.YYYY"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Подразделение"
                        name="division"
                        rules={[
                            {
                                required: true,
                                message: "Выберите подразделение",
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="label"
                            options={divisions.map(division => ({
                                value: division.id,
                                label: division.name,
                            }))}
                            onChange={() => {
                                statementForm.setFieldValue("employee", undefined);
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Сотрудник"
                        name="employee"
                        rules={[
                            {
                                required: true,
                                message: "Выберите сотрудника",
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="label"
                            disabled={!formDivision}
                            options={divisionEmployees.map(employee => ({
                                value: employee.id,
                                label: `${employee.fullName} (${employee.personnelNumber})`,
                            }))}
                        />
                    </Form.Item>

                    {formEmployee && (
                        <div className="bg-gray-100 rounded-lg p-3 mb-4">
                            {(() => {
                                const employee = employees.find(
                                    item => item.id === formEmployee
                                );

                                if (!employee) return null;

                                const contractPosition =
                                    employee.expand?.contractPosition?.name ??
                                    divisions
                                        .find(division => division.id === formDivision)
                                        ?.expand?.contract_positions
                                        ?.find(
                                            position =>
                                                position.id === employee.contractPosition
                                        )?.name ??
                                    "-";

                                const ppePosition =
                                    employee.expand?.positionRelation?.name ??
                                    positions.find(
                                        position =>
                                            position.id === employee.positionRelation
                                    )?.name ??
                                    "-";

                                return (
                                    <>
                                        <p>
                                            <strong>Должность по трудовому договору:</strong>{" "}
                                            {contractPosition}
                                        </p>
                                        <p>
                                            <strong>Должность по СИЗ:</strong>{" "}
                                            {ppePosition}
                                        </p>
                                    </>
                                );
                            })()}
                        </div>
                    )}

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

            {/* Добавление норм и складской номенклатуры */}
            <Modal
                title="Нормы выдачи СИЗ сотруднику"
                open={isAddItemsModalOpen}
                onCancel={() => {
                    setIsAddItemsModalOpen(false);
                    itemsForm.resetFields();
                    setStandards([]);
                }}
                footer={null}
                width={1000}
                destroyOnHidden
            >
                <div className="mb-4">
                    <Typography.Text strong>
                        Сотрудник: {selectedEmployee?.fullName ?? "-"}
                    </Typography.Text>
                    <br />
                    <Typography.Text type="secondary">
                        Должность по СИЗ: {ppePositionName}
                    </Typography.Text>
                </div>

                {isLoadingStandards ? (
                    <div className="flex justify-center p-8">
                        <Spin tip="Загрузка норм СИЗ..." />
                    </div>
                ) : (
                    <Form
                        form={itemsForm}
                        layout="vertical"
                        onFinish={handleAddStatementItems}
                    >
                        <Form.List name="items">
                            {(fields, { remove, add }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <div
                                            key={key}
                                            className="border rounded-lg p-4 mb-4"
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <Typography.Title level={5} className="!mb-0">
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
                                                label="Номенклатура по нормам СИЗ"
                                                name={[name, "nomenclature"]}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: "Не указана номенклатура по нормам",
                                                    },
                                                ]}
                                            >
                                                <Input />
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                label="Номенклатура складского учёта"
                                                name={[name, "warehouse_nomenclature"]}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message: "Выберите складскую номенклатуру",
                                                    },
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
                                                        {
                                                            required: true,
                                                            message: "Укажите количество",
                                                        },
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
                                                        {
                                                            required: true,
                                                            message: "Укажите единицу измерения",
                                                        },
                                                    ]}
                                                >
                                                    <Input />
                                                </Form.Item>

                                                <Form.Item
                                                    {...restField}
                                                    label="Срок носки (в месяцах)"
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
                                                        options={[
                                                            {
                                                                value: "month",
                                                                label: "Месяцы",
                                                            },
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
                                        onClick={() =>
                                            add({
                                                quantity: 1,
                                                unit: "",
                                                nomenclature: "",
                                                warehouse_nomenclature: "",
                                            })
                                        }
                                    >
                                        Добавить позицию вручную
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
                            disabled={standards.length === 0 && !itemsForm.getFieldValue("items")?.length}
                        >
                            Сохранить позиции
                        </Button>
                    </Form>
                )}
            </Modal>
            {selectedStatement && (
                <PpeIssuanceStatementPrint
                    statement={selectedStatement}
                    items={selectedStatementItems}
                    employees={employees}
                    divisions={divisions}
                />
            )}
        </>
    );
};