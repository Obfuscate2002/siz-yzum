import {message, Table, Typography} from "antd";
import {useEffect, useState} from "react";
import type {WarehouseNomenclature} from "../types/WarehouseNomenclature.ts";
import {getWarehouseNomenclatures} from "../hooks/useWarehouseNomenclatures.ts";
import {
    ImportWarehouseNomenclatureButton
} from "../components/warehouseNomenclature/ImportWarehouseNomenclatureButton.tsx";
import {FileTextTwoTone} from "@ant-design/icons";

export const PageWarehouseNomenclature = () => {

    const [warehouseNomenclatures, setWarehouseNomenclatures] = useState<WarehouseNomenclature[]>([])

    const loadData = async () => {
        try {
            setWarehouseNomenclatures(await getWarehouseNomenclatures())
        } catch (error) {
            message.error('Ошибка загрузки номенклатуры')
        }
    }

    useEffect(() => {
        void loadData()
    }, [])



    const columns = [
        {
            title: 'Наименование',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Тип',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Код товара',
            dataIndex: 'productCode',
            key: 'productCode',
        },
        {
            title: 'Количество',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Единица измерения',
            dataIndex: 'unit',
            key: 'unit',
        },
    ];

    return (
        <div className={'flex flex-col gap-3'}>
            <Typography.Title level={1}><FileTextTwoTone /> Справочник номенклатуры</Typography.Title>
            <div>
                <ImportWarehouseNomenclatureButton/>
            </div>
            <Table dataSource={warehouseNomenclatures} columns={columns} />
        </div>

    )
}