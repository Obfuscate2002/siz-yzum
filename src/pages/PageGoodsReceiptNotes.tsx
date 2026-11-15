import {Button, DatePicker, Divider, Form, Input, Space, Table, Typography, type TableColumnsType} from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    FileTextTwoTone,
    PlusOutlined,
    SearchOutlined,
    SyncOutlined
} from "@ant-design/icons";
import Text from "antd/es/typography/Text";
import {useNavigate} from "react-router";
import {useWarehouseReceipts} from "../hooks/useWarehouseReceipts.tsx";
import type {WarehouseReceipt} from "../api/warehouseReceipts.api.ts";
import {ImportWarehouseReceiptsButton} from "../components/warehouseReceipt/ImportWarehouseReceiptsButton.tsx";
import {useWarehouseReceiptItems} from "../hooks/useWarehouseReceiptItems.tsx";

export const PageGoodsReceiptNotes = () => {

    const navigate = useNavigate();

    const [form] = Form.useForm();

    const {
        data: warehouseReceipts = [],
        isLoading,
        isError,
        error,
    } = useWarehouseReceipts()

    const {
        data: receiptItems = [],
        isLoading: isItemsLoading,
    } = useWarehouseReceiptItems();

    const handleView = (record: WarehouseReceipt) => {
        console.log('Просмотр:', record);
    }

    const handleEdit = (record: WarehouseReceipt) => {
        console.log('Редактирование:', record);
    }

    const handleDelete = (record: WarehouseReceipt) => {
        console.log('Удаление:', record.id);
    }



    const columns: TableColumnsType<WarehouseReceipt> = [
        {
            title: '№',
            key: 'number',
            width: 65,
            render: (_value: unknown, _record: unknown, index: number) => index + 1,
        },
        {
            title: 'Контрагент',
            dataIndex: 'counterparty',
            key: 'counterparty',
            render: (_: unknown, record: WarehouseReceipt) => {
                return record.expand?.counterparty?.name || '-'
            }
        },
        {
            title: 'Документ прихода сч.ф.',
            dataIndex: 'documentNumber',
            key: 'documentNumber',
        },
        {
            title: 'Дата прихода',
            dataIndex: 'receiptDate',
            key: 'receiptDate',
            render: (value: string) =>
                value
                    ? new Date(value).toLocaleDateString('ru-RU')
                    : '-',
        },
        {
            title: 'Стоимость товаров с налогом — всего',
            key: 'amountWithTax',
            render: (_, record: WarehouseReceipt) => {
                const items = receiptItems.filter(
                    item => item.receipt === record.id
                );

                const total = items.reduce(
                    (sum, item) => sum + Number(item.amountWithTax || 0),
                    0
                );

                return (
                    <div>
                        <div>
                            {total.toLocaleString('ru-RU', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </div>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            Строк: {items.length}
                        </Text>
                    </div>
                );
            },
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 130,
            render: (_value: unknown, record: WarehouseReceipt) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    />

                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />

                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    />
                </Space>
            ),
        },
    ];

    if(isError) {
        return (
            <Typography.Text type={'danger'}> Ошибка загрузки приходных накладных {error.message}</Typography.Text>
        )
    }



    return (
        <>
            <div className={'flex justify-between'}>
                <div className={'flex border gap-3 bg-blue-300/20 rounded-lg border-blue-300 p-3 w-200'}>
                    <FileTextTwoTone style={{ fontSize: '40px' }}/>
                    <div className={'flex flex-col'}>
                        <Typography.Title level={2}> Приходные накладные</Typography.Title>
                        <Text>Учет поступления товаров</Text>
                    </div>
                </div>
                <div className={'flex justify-center items-center'}>
                    <Button
                        variant={'solid'}
                        color={'blue'}
                        onClick={() => navigate("/warehouse/goodsReceiptNotes/create")}
                    >
                        <PlusOutlined />Добавить накладную
                    </Button>
                </div>
            </div>

            <Divider />
            <Form form={form} layout={'vertical'}>
                <div className={'flex flex-row gap-5'}>
                    <Form.Item
                        className={''}
                        name={'documentNumber'}
                        label="Номер документа:"
                    >
                        <Input placeholder={'Введите номер...'} />
                    </Form.Item>
                    <Form.Item name={'date'} label="Дата:">
                        <DatePicker/>
                    </Form.Item>
                    <div className={'flex flex-row gap-3 justify-center items-center'}>
                        <Button
                            variant={'outlined'}
                            color={'blue'}
                            onClick={() => form.resetFields()}
                        >
                            <SyncOutlined />Сбросить
                        </Button>
                        <Button variant={'solid'} color={'blue'}><SearchOutlined />Найти</Button>

                    </div>

                </div>
            </Form>
            <ImportWarehouseReceiptsButton/>
            <Divider />
            <div>
                <Table
                    rowKey={'id'}
                    columns={columns}
                    dataSource={warehouseReceipts}
                    loading={isLoading || isItemsLoading}
                />
            </div>
        </>
    )
}