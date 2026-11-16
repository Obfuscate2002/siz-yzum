import {Card, Empty, Spin, Table} from "antd";
import type {WarehouseReceipt} from "../../types/WarehouseReceipt.ts";
import type {WarehouseReceiptItem} from "../../types/WarehouseReceiptItem.ts";

interface WarehouseReceiptDetailsProps {
    receipt: WarehouseReceipt | null;
    items?: WarehouseReceiptItem[];
    loading: boolean;
}

export const WarehouseReceiptDetails = ({receipt, items, loading = false}: WarehouseReceiptDetailsProps) => {
    if(loading || items === undefined) {
        return (
            <Spin>Загрузка позиций накладной...</Spin>
        )
    }

    if(!receipt) {
        return <Empty description="Накладная не выбрана" />
    }

    const columns = [
        {
            title: "№",
            key: "index",
            width: 55,
            render: (_: unknown, __: WarehouseReceiptItem, index: number) => (
                <span className="text-gray-400">{index + 1}</span>
            ),
        },
        {
            title: "Код товара",
            dataIndex: "productCode",
            key: "productCode",
            width: 120,
        },
        {
            title: "Наименование",
            dataIndex: "productName",
            key: "productName",
            render: (value: string) => (
                <span className="font-medium text-gray-800">{value || "-"}</span>
            ),
        },
        {
            title: "Количество",
            dataIndex: "quantity",
            key: "quantity",
            align: "right" as const,
            width: 110,
        },
        {
            title: "Цена",
            dataIndex: "unitPrice",
            key: "unitPrice",
            align: "right" as const,
            width: 130,
            render: (value: number) => (
                <span className="text-gray-600">
                {Number(value || 0).toLocaleString("ru-RU")} ₽
            </span>
            ),
        },
        {
            title: "Сумма с налогом",
            dataIndex: "amountWithTax",
            key: "amountWithTax",
            align: "right" as const,
            width: 150,
            render: (value: number) => (
                <span className="font-semibold text-gray-800">
                {Number(value || 0).toLocaleString("ru-RU")} ₽
            </span>
            ),
        },
    ];

    const totalWithoutTax = items.reduce(
        (sum, item) => sum + Number(item.amountWithoutTax || 0),
        0
    );

    const totalTax = items.reduce(
        (sum, item) => sum + Number(item.taxAmount || 0),
        0
    );

    const totalWithTax = items.reduce(
        (sum, item) => sum + Number(item.amountWithTax || 0),
        0
    );

    const formatPrice = (value: number) =>
        `${value.toLocaleString("ru-RU")} ₽`;

    return (
        <div className={'flex flex-col gap-3'}>
            <Card
                title={
                    <span className="font-semibold text-gray-800">
            Основная информация
        </span>
                }
                className="shadow-sm"
                styles={{ body: { padding: 20 } }}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    <div>
                        <div className="text-xs text-gray-400 mb-1">
                            Номер документа
                        </div>
                        <div className="font-semibold text-gray-800">
                            {receipt?.documentNumber || "-"}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs text-gray-400 mb-1">
                            Дата прихода
                        </div>
                        <div className="font-semibold text-gray-800">
                            {receipt?.receiptDate
                                ? new Date(receipt.receiptDate).toLocaleDateString("ru-RU")
                                : "-"}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs text-gray-400 mb-1">
                            Контрагент
                        </div>
                        <div className="font-semibold text-gray-800">
                            {receipt?.expand?.counterparty?.name || "-"}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs text-gray-400 mb-1">
                            Количество позиций
                        </div>
                        <div className="font-semibold text-gray-800">
                            {items.length} товаров
                        </div>
                    </div>

                </div>
            </Card>
            <Card title="Товары накладной">
                <Table
                    rowKey={'id'}
                    dataSource={items}
                    columns={columns}
                    pagination={false}
                    loading={loading} />
            </Card>
            <Card
                className="shadow-sm"
                styles={{ body: { padding: 20 } }}
            >
                <div className="flex flex-col gap-4">

                    <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-gray-800">
                Итоговая стоимость
            </span>
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                Рассчитано
            </span>
                    </div>

                    <div className="h-px bg-gray-100" />

                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Без налога</span>
                        <span className="font-semibold text-gray-800">
                {formatPrice(totalWithoutTax)}
            </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Налог</span>
                        <span className="font-semibold text-gray-800">
                {formatPrice(totalTax)}
            </span>
                    </div>

                    <div className="h-px bg-gray-200" />

                    <div className="rounded-xl bg-green-50 p-4">
                        <div className="text-sm font-medium text-green-700 mb-1">
                            К оплате с налогом
                        </div>
                        <div className="text-2xl font-bold text-green-800">
                            {formatPrice(totalWithTax)}
                        </div>
                    </div>

                </div>
            </Card>
        </div>

    )
}