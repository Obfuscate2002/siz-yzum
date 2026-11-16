import {
    Button,
    DatePicker,
    Divider,
    Form,
    Input,
    Space,
    Table,
    Typography,
    type TableColumnsType,
    Tooltip,
    Modal, message
} from "antd";
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
import {useWarehouseReceipts, warehouseReceiptsKey} from "../hooks/useWarehouseReceipts.tsx";
import {deleteWarehouseReceipt, type WarehouseReceipt} from "../api/warehouseReceipts.api.ts";
import {ImportWarehouseReceiptsButton} from "../components/warehouseReceipt/ImportWarehouseReceiptsButton.tsx";
import {useWarehouseReceiptItems, warehouseReceiptItemsKey} from "../hooks/useWarehouseReceiptItems.tsx";
import {WarehouseReceiptDrawer} from "../components/warehouseReceipt/WarehouseReceiptDrawer.tsx";
import {useState} from "react";
import {deleteWarehouseReceiptItems} from "../api/warehouseReceiptItems.api.ts";
import {useQueryClient} from "@tanstack/react-query";

export const PageGoodsReceiptNotes = () => {

    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [selectedReceipt, setSelectedReceipt] = useState<WarehouseReceipt | null>(null);

    const queryClient = useQueryClient();

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
        setSelectedReceipt(record);
        setIsDrawerOpen(true);
    }

    const handleEdit = (record: WarehouseReceipt) => {
        console.log('Редактирование:', record);
    }

    const handleDelete = (record: WarehouseReceipt) => {
        Modal.confirm({
            title: "Удаление приходной накладной",
            content: (
                <div className="flex flex-col gap-2">
                <span>
                    Вы действительно хотите удалить накладную?
                </span>

                    <span className="font-semibold">
                    Документ № {record.documentNumber}
                </span>

                    <span className="text-red-500 text-sm">
                    Все товарные позиции этой накладной также будут удалены.
                </span>
                </div>
            ),
            okText: "Удалить",
            cancelText: "Отмена",
            okButtonProps: {
                danger: true,
            },
            async onOk() {
                try {
                    // 1. Удаляем все товарные позиции накладной
                    await deleteWarehouseReceiptItems(record.id);

                    // 2. Удаляем саму накладную
                    await deleteWarehouseReceipt(record.id);

                    await Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: warehouseReceiptsKey
                        }),
                        queryClient.invalidateQueries({
                            queryKey: warehouseReceiptItemsKey
                        })
                    ])

                    // 3. Если удалённая накладная открыта в Drawer — закрываем его
                    if (selectedReceipt?.id === record.id) {
                        setIsDrawerOpen(false);
                        setSelectedReceipt(null);
                    }

                    message.success("Приходная накладная успешно удалена");
                } catch (error) {
                    console.error("Ошибка удаления накладной:", error);
                    message.error("Не удалось удалить приходную накладную");

                    throw error;
                }
            },
        });
    };

    const getReceiptAmountWithTax = (receiptId: string) => {
        return receiptItems
            .filter(item => item.receipt === receiptId)
            .reduce((sum, item) => {
                return sum + Number(item.amountWithTax || 0);
            }, 0);
    };


    const columns: TableColumnsType<WarehouseReceipt> = [
        {
            title: "№",
            key: "number",
            width: 65,
            align: "center",
            render: (_value: unknown, _record: WarehouseReceipt, index: number) => (
                <span className="text-gray-400 font-medium">
                {index + 1}
            </span>
            ),
        },
        {
            title: "Контрагент",
            dataIndex: "counterparty",
            key: "counterparty",
            render: (_: unknown, record: WarehouseReceipt) => (
                <div className="flex flex-col gap-1">
                <span className="font-semibold text-gray-800">
                    {record.expand?.counterparty?.name || "-"}
                </span>
                    <span className="text-xs text-gray-400">
                    Поставщик
                </span>
                </div>
            ),
        },
        {
            title: "Документ прихода сч.ф.",
            dataIndex: "documentNumber",
            key: "documentNumber",
            render: (value: string) => (
                <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700">
                {value || "-"}
            </span>
            ),
        },
        {
            title: "Дата прихода",
            dataIndex: "receiptDate",
            key: "receiptDate",
            render: (value: string) => (
                <span className="text-gray-600">
                {value
                    ? new Date(value).toLocaleDateString("ru-RU")
                    : "-"}
            </span>
            ),
        },
        {
            title: "Стоимость товаров с налогом — всего",
            key: "amountWithTax",
            align: "right",
            render: (_value: unknown, record: WarehouseReceipt) => (
                <span className="font-semibold text-gray-800 whitespace-nowrap">
                {getReceiptAmountWithTax(record.id).toLocaleString("ru-RU", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })} ₽
            </span>
            ),
        },
        {
            title: "Действия",
            key: "actions",
            width: 145,
            align: "center",
            render: (_value: unknown, record: WarehouseReceipt) => (
                <Space size={4}>
                    <Tooltip title="Просмотреть">
                        <Button
                            type="text"
                            className="!text-blue-600 hover:!bg-blue-50"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>

                    <Tooltip title="Редактировать">
                        <Button
                            type="text"
                            className="!text-orange-500 hover:!bg-orange-50"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>

                    <Tooltip title="Удалить">
                        <Button
                            type="text"
                            danger
                            className="hover:!bg-red-50"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record)}
                        />
                    </Tooltip>
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
                <WarehouseReceiptDrawer
                    open={isDrawerOpen}
                    receipt={selectedReceipt}
                    onClose={() => setIsDrawerOpen(false)}
                    items={(receiptItems ?? []).filter(item => item.receipt === selectedReceipt?.id)}
                    loading={isItemsLoading}
                />
            </div>
        </>
    )
}