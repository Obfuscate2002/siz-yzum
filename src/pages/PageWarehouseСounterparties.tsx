import {message, Table, Typography} from "antd";
import {useEffect, useState} from "react";
import {getWarehouseСounterparties} from "../hooks/useWarehouseСounterparties.tsx";
import type {WarehouseСounterpartie} from "../types/WarehouseСounterpartie.ts";
import {IdcardTwoTone} from "@ant-design/icons";

export const PageWarehouseСounterparties = () => {

    const [warehouseСounterparties, setWarehouseСounterparties] = useState<WarehouseСounterpartie[]>([]);

    const loadData = async () => {
        try {
            setWarehouseСounterparties(await getWarehouseСounterparties())
        } catch (error) {
            message.error('Ошибка получения списка контрагентов')
        }
    }

    useEffect(() => {
        void loadData();
    }, [])


    const columns = [
        {
            title: 'Наименование',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'ИНН',
            dataIndex: 'inn',
            key: 'inn',
        },
        {
            title: 'КПП',
            dataIndex: 'kpp',
            key: 'kpp',
        },
    ];

    return (
        <div>
            <Typography.Title level={1}><IdcardTwoTone /> Справочник контрагентов</Typography.Title>
            <Table rowKey={'id'} columns={columns} dataSource={warehouseСounterparties} />
        </div>
    )
}