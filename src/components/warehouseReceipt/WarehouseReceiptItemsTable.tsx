
import { useState } from 'react';
import { Button, Input, InputNumber, Table, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

// Тип одной товарной позиции
interface ReceiptItem {
    id: string;
    name: string;
    code: string;
    unit: string;
    quantity: number;
    price: number;
    taxRate: number;
}

export const WarehouseReceiptItemsTable = () => {

    // Состояние товарных позиций
    const [dataSource, setDataSource] = useState<ReceiptItem[]>([
        {
            id: '1',
            name: 'Перчатки',
            code: '001',
            unit: 'шт.',
            quantity: 10,
            price: 100,
            taxRate: 20,
        },
    ]);

    // Удаление позиции
    const handleDelete = (id: string): void => {
        setDataSource(prev => prev.filter(item => item.id !== id));
    };

    // Добавление позиции
    const handleAdd = (): void => {
        const newItem: ReceiptItem = {
            id: crypto.randomUUID(),
            name: '',
            code: '',
            unit: '',
            quantity: 1,
            price: 0,
            taxRate: 20,
        };

        setDataSource(prev => [...prev, newItem]);
    };

    // Изменение значения позиции
    const handleChange = (
        id: string,
        field: keyof ReceiptItem,
        value: string | number | null
    ): void => {
        setDataSource(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, [field]: value ?? 0 }
                    : item
            )
        );
    };

    // Колонки таблицы с типизацией
    const columns: TableColumnsType<ReceiptItem> = [
        {
            title: '№',
            key: 'number',
            render: (_value, _record, index) => index + 1,
        },
        {
            title: 'Номенклатура',
            dataIndex: 'name',
            key: 'name',
            render: (value: string, record: ReceiptItem) => (
                <Input
                    value={value}
                    placeholder="Наименование товара"
                    onChange={e =>
                        handleChange(record.id, 'name', e.target.value)
                    }
                />
            ),
        },
        {
            title: 'Код',
            dataIndex: 'code',
            key: 'code',
            render: (value: string, record: ReceiptItem) => (
                <Input
                    value={value}
                    placeholder="Код"
                    onChange={e =>
                        handleChange(record.id, 'code', e.target.value)
                    }
                />
            ),
        },
        {
            title: 'Ед. изм.',
            dataIndex: 'unit',
            key: 'unit',
            render: (value: string, record: ReceiptItem) => (
                <Input
                    value={value}
                    placeholder="шт."
                    onChange={e =>
                        handleChange(record.id, 'unit', e.target.value)
                    }
                />
            ),
        },
        {
            title: 'Количество',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (value: number, record: ReceiptItem) => (
                <InputNumber
                    min={0}
                    value={value}
                    className="w-full"
                    onChange={value =>
                        handleChange(record.id, 'quantity', value)
                    }
                />
            ),
        },
        {
            title: 'Цена, ₽',
            dataIndex: 'price',
            key: 'price',
            render: (value: number, record: ReceiptItem) => (
                <InputNumber
                    min={0}
                    value={value}
                    className="w-full"
                    onChange={value =>
                        handleChange(record.id, 'price', value)
                    }
                />
            ),
        },
        {
            title: 'НДС, %',
            dataIndex: 'taxRate',
            key: 'taxRate',
            render: (value: number, record: ReceiptItem) => (
                <InputNumber
                    min={0}
                    max={100}
                    value={value}
                    className="w-full"
                    onChange={value =>
                        handleChange(record.id, 'taxRate', value)
                    }
                />
            ),
        },
        {
            title: 'Сумма с НДС, ₽',
            key: 'amountWithTax',
            render: (_value, record) => {
                const amount = record.quantity * record.price;
                const tax = amount * record.taxRate / 100;

                return (amount + tax).toFixed(2);
            },
        },
        {
            title: 'Действия',
            key: 'action',
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
