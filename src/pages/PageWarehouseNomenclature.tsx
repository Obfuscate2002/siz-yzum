import {message, Table} from "antd";
import {useEffect, useState} from "react";
import type {WarehouseNomenclature} from "../types/WarehouseNomenclature.ts";
import {getWarehouseNomenclatures} from "../hooks/useWarehouseNomenclatures.ts";

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
        <Table dataSource={warehouseNomenclatures} columns={columns} />
    )
}