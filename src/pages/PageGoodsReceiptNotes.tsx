import {Button, DatePicker, Divider, Form, Input, Space, Table, Typography} from "antd";
import {DeleteOutlined, EditOutlined, EyeOutlined, FileTextTwoTone, PlusOutlined, SearchOutlined, SyncOutlined} from "@ant-design/icons";
import Text from "antd/es/typography/Text";
import type {WarehouseReceiptItem} from "../types/WarehouseReceiptItem.ts";
import {useWarehouseReceiptItems} from "../hooks/useWarehouseReceiptItems.tsx";

export const PageGoodsReceiptNotes = () => {

    const [form] = Form.useForm();

    const {
        data: warehouseReceiptItems = [],
        isLoading,
        isError,
        error,
    } = useWarehouseReceiptItems()

    const handleView = (record: WarehouseReceiptItem) => {
        console.log('Просмотр:', record);
    }

    const handleEdit = (record: WarehouseReceiptItem) => {
        console.log('Редактирование:', record);
    }

    const handleDelete = (id: string) => {
        console.log('Удаление:', id);
    }



    const columns = [
        {
            title: 'Контрагент',
            key: 'receipt',
            render: (_: unknown, record: WarehouseReceiptItem) => {
                return record.expand?.receipt?.counterparty ?? '-';
            },
        },
        {
            title: 'Документ прихода сч.ф.',
            key: 'documentNumber',
            render: (_: unknown, record: WarehouseReceiptItem) =>
                record.expand?.receipt?.documentNumber ?? '-',
        },
        {
            title: 'Дата прихода',
            key: 'receiptDate',
            render: (_: unknown, record: WarehouseReceiptItem) => {
                const date = record.expand?.receipt?.receiptDate;

                return date
                    ? new Date(date).toLocaleDateString('ru-RU')
                    : '-';
            },
        },
        {
            title: 'Код товара/ работ, услуг',
            dataIndex: 'productCode',
            key: 'productCode',
        },
        {
            title: 'Наименование товара (описание выполненных работ, оказанных услуг), имущественного права',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: 'Ед. изм.',
            dataIndex: 'unit',
            key: 'unit',
        },
        {
            title: 'Количество (объем)',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Цена (тариф)  за единицу измерения',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
        },
        {
            title: 'Стоимость товаров (работ,услуг), имущественных прав без налога - всего',
            dataIndex: 'amountWithoutTax',
            key: 'amountWithoutTax',
        },
        {
            title: 'Налоговая ставка',
            dataIndex: 'taxRate',
            key: 'taxRate',
        },
        {
            title: 'Сумма налога, предъявляемая покупателю',
            dataIndex: 'taxAmount',
            key: 'taxAmount',
        },
        {
            title: 'Стоимость товаров  (работ, услуг), имущественных прав с налогом - всего',
            dataIndex: 'amountWithTax',
            key: 'amountWithTax',
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_: unknown, record: WarehouseReceiptItem) => (
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
                        onClick={() => handleDelete(record.id)}/>
                </Space>
            )
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
                    <Button variant={'solid'} color={'blue'}><PlusOutlined />Добавить накладную</Button>
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
                        <Button variant={'outlined'} color={'blue'}><SyncOutlined />Сбросить</Button>
                        <Button variant={'solid'} color={'blue'}><SearchOutlined />Найти</Button>

                    </div>

                </div>
            </Form>
            <Divider />
            <div>
                <Table
                    rowKey={'id'}
                    columns={columns}
                    dataSource={warehouseReceiptItems}
                    loading={isLoading}
                />
            </div>
        </>
    )
}