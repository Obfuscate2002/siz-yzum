import {Button, Input, InputNumber, Select, Table, Typography} from 'antd';
import type { TableColumnsType } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {useWarehouseNomenclature} from "../../hooks/useWarehouseNomenclature.tsx";

// Тип одной товарной позиции
export interface ReceiptItem {
    id: string;
    nomenclatureId: string;
    name: string;
    code: string;
    unit: string;
    quantity: number;
    price: number;
    taxRate: number;
}

interface WarehouseReceiptItemsTableProps {
    dataSource: ReceiptItem[];
    onChange: (items: ReceiptItem[]) => void;
}

export const WarehouseReceiptItemsTable = ({dataSource, onChange}: WarehouseReceiptItemsTableProps) => {


    const {
        data: nomenclature = [],
        isLoading,
    } = useWarehouseNomenclature();

    // Удаление позиции
    const handleDelete = (id: string): void => {
        onChange(dataSource.filter((item) => item.id === id));
    };

    // Добавление позиции
    const handleAdd = (): void => {
        const newItem: ReceiptItem = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            nomenclatureId: '',
            name: '',
            code: '',
            unit: '',
            quantity: 1,
            price: 0,
            taxRate: 20,
        };

        onChange([...dataSource, newItem]);
    };

    const handleNomenclatureChange = (
        itemId: string,
        nomenclatureId: string | undefined): void => {

        const selected = nomenclature.find((item) => item.id === nomenclatureId)

        onChange(dataSource.map(item => item.id === itemId
            ?
            {...item,
                nomenclatureId: selected?.id ?? "",
                name: selected?.name ?? "",
                code: selected?.productCode ?? "",
                unit: selected?.unit ?? "",
            } : item))

    }

    // Изменение значения позиции
    const handleTextChange = (
        id: string,
        field: "name" | "code" | "unit",
        value: string
    ): void => {
        onChange(dataSource.map((item) => item.id === id ? {...item, [field]: value} : item));
    };

    // Изменение числовых значений
    const handleNumberChange = (
        id: string,
        field: "quantity" | "price" | "taxRate",
        value: number | null
    ): void => {
        onChange(
            dataSource.map(item =>
                item.id === id
                    ? { ...item, [field]: value ?? 0 }
                    : item
            )
        );
    };

    // Колонки таблицы с типизацией
    const columns: TableColumnsType<ReceiptItem> =  [
        {
            title: "№",
            key: "number",
            width: 60,
            render: (_value, _record, index) => index + 1,
        },
        {
            title: "Номенклатура",
            dataIndex: "name",
            key: "name",
            width: 500,
            render: (_: unknown, record: ReceiptItem) => (
                <Select
                    allowClear
                    className="min-w-[500px]"
                    loading={isLoading}
                    placeholder="Выберите номенклатуру"
                    value={record.nomenclatureId || undefined}
                    options={nomenclature.map(item => ({
                        value: item.id,
                        label: item.name,
                    }))}
                    labelRender={({ label }) => (
                        <div className="whitespace-normal break-words">
                            {label}
                        </div>
                    )}
                    onChange={value => handleNomenclatureChange(record.id, value)}
                    styles={{
                        popup: {
                            root: {
                                maxWidth: 500,
                            },
                        },
                    }}
                />
            )
        },
        {
            title: "Код",
            dataIndex: "code",
            key: "code",
            render: (_: unknown, record) => (
                <Input
                    value={record.code}
                    disabled={!!record.nomenclatureId}
                    placeholder="Код"
                    onChange={e =>
                        handleTextChange(record.id, "code", e.target.value)
                    }
                />
            ),
        },
        {
            title: "Ед. изм.",
            dataIndex: "unit",
            key: "unit",
            render: (_: unknown, record) => (
                <Input
                    value={record.unit}
                    disabled={!!record.nomenclatureId}
                    placeholder="шт."
                    onChange={e =>
                        handleTextChange(record.id, "unit", e.target.value)
                    }
                />
            ),
        },
        {
            title: "Количество",
            dataIndex: "quantity",
            key: "quantity",
            render: (value: number, record) => (
                <InputNumber
                    min={0}
                    value={value}
                    className="w-full"
                    onChange={value =>
                        handleNumberChange(record.id, "quantity", value)
                    }
                />
            ),
        },
        {
            title: "Цена, ₽",
            dataIndex: "price",
            key: "price",
            render: (value: number, record) => (
                <InputNumber
                    min={0}
                    value={value}
                    className="w-full"
                    onChange={value =>
                        handleNumberChange(record.id, "price", value)
                    }
                />
            ),
        },
        {
            title: "НДС, %",
            dataIndex: "taxRate",
            key: "taxRate",
            render: (value: number, record) => (
                <InputNumber
                    min={0}
                    max={100}
                    value={value}
                    className="w-full"
                    onChange={value =>
                        handleNumberChange(record.id, "taxRate", value)
                    }
                />
            ),
        },
        {
            title: "Сумма с НДС, ₽",
            key: "amountWithTax",
            render: (_value, record) => {
                const amount = record.quantity * record.price;
                const tax = amount * record.taxRate / 100;

                return (amount + tax).toFixed(2);
            },
        },
        {
            title: "Действия",
            key: "action",
            width: 80,
            render: (_value, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record.id)}
                />
            ),
        },
    ];

    // Общая сумма накладной
    const totalAmount = dataSource.reduce((total, item) => {
        const amount = item.quantity * item.price;
        const tax = amount * item.taxRate / 100;

        return total + amount + tax;
    }, 0);

    return (
        <div>
            <Table<ReceiptItem>
                rowKey="id"
                columns={columns}
                dataSource={dataSource}
                pagination={false}
            />

            <div className="flex justify-between items-center p-3">
                <Button
                    variant="outlined"
                    color="blue"
                    onClick={handleAdd}
                    icon={<PlusOutlined />}
                >
                    Добавить позицию
                </Button>

                <Typography.Title level={4} className="!m-0">
                    Итого (с НДС):{' '}
                    {totalAmount.toLocaleString('ru-RU', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })} ₽
                </Typography.Title>
            </div>
        </div>
    );
};
