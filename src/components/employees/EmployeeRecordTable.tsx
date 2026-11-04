import {Empty, Table} from "antd";
import type {PpeIssuanceStandard, PpeIssuanceStandardExpanded} from "../../types/ppeIssuanceStandards.ts";
import type {ColumnsType} from "antd/es/table";


type EmployeeRecordTableProps = {
    positionId?: string;
    ppeIssuanceStandards?: PpeIssuanceStandardExpanded[];
}

export const EmployeeRecordTable = ({positionId, ppeIssuanceStandards}: EmployeeRecordTableProps ) => {
    if(ppeIssuanceStandards === undefined) return

    const filteredStandards = positionId ? ppeIssuanceStandards.filter(item => item.position === positionId) : []

    const columns: ColumnsType<PpeIssuanceStandard> = [
        {
            title: 'Наименование СИЗ',
            dataIndex: 'ppe_name',
            key: 'ppe_name',
        },
        {
            title: 'Пункт норм',
            dataIndex: 'issuance_basis',
            key: 'issuance_basis',
        },
        {
            title: 'Периодичность выдачи',
            dataIndex: 'issuance_period',
            key: 'issuance_period',
        },
        {
            title: 'Количество',
            dataIndex: 'quantity',
            key: 'quantity',
        },
    ];

    return (
        <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredStandards}
            pagination={false}
            locale={{
                emptyText: (
                    <Empty description={
                        positionId
                            ? "Для этой должности нормы не найдены"
                            : "Должность не выбрана"
                    } />
                ),
            }}
        />
    )
}