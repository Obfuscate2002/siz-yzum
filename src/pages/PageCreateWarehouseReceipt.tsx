import {Button, Typography} from "antd";
import {
    DoubleLeftOutlined,
    FileAddTwoTone,
    FileTextTwoTone, MehTwoTone, SaveOutlined,
} from "@ant-design/icons";
import {useNavigate} from "react-router";
import {WarehouseReceiptDetailsForm} from "../components/warehouseReceipt/WarehouseReceiptDetailsForm.tsx";
import {WarehouseReceiptItemsTable} from "../components/warehouseReceipt/WarehouseReceiptItemsTable.tsx";


export const PageCreateWarehouseReceipt = () => {

    const navigate = useNavigate();

    return (
        <div className={'flex flex-col gap-3'}>
            <div >
                <Button
                    variant={'link'}
                    color={'geekblue'}
                    onClick={() => {
                        navigate('/warehouse/goodsReceiptNotes/')
                    }}
                >
                    <DoubleLeftOutlined/>Вернуться назад
                </Button>
            </div>

            <div>
                <Typography.Title level={2}><FileAddTwoTone /> Добавление приходной накладной</Typography.Title>
            </div>

            <div className={'flex flex-col gap-1 border border-blue-300 rounded-lg'}>
                <div className={'flex bg-blue-300/20 p-3'}>
                    <Typography.Title level={3}><FileTextTwoTone /> Реквизиты накладной</Typography.Title>
                </div>
                <div className={'flex flex-row p-3 gap-3'}>
                    <WarehouseReceiptDetailsForm/>
                </div>
            </div>
            <div className={'flex flex-col border border-blue-300 rounded-lg'}>
                <div className={'flex bg-blue-300/20 p-3'}>
                    <Typography.Title level={3}><MehTwoTone /> Товары</Typography.Title>
                </div>
                <div className={'pt-3 pb-1'}>
                    <WarehouseReceiptItemsTable/>
                </div>

            </div>
            <div className={'flex justify-between px-3'}>
                <Button
                    variant={'outlined'}
                    color={'geekblue'}
                >
                    Отмена
                </Button>
                <Button
                    className={'p-5'}
                    variant={'solid'}
                    color={'geekblue'}
                >
                    <SaveOutlined />Сохранить накладную
                </Button>
            </div>
        </div>
    )
}