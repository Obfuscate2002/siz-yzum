
import {
    type ColumnDef,
    columnFilteringFeature, type ColumnFiltersState,
    createFilteredRowModel,
    filterFn_includesString,
    tableFeatures, useTable
} from "@tanstack/react-table";

import {UserOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import {Input, message} from "antd";
import {ImportEmployees} from "../employees/ImportEmployees.tsx";
import {getIssuanceNormHeaders} from "../../hooks/useIssuanceNorms.tsx";
import {IssuanceNormModal} from "./IssuanceNormModal.tsx";
import type {IssuanceNormHeaderExpanded} from "../../types/norms.ts";
import {IssuanceNormRecord} from "./IssuanceNormRecord.tsx";

const features = tableFeatures({
    columnFilteringFeature,
    filteredRowModel: createFilteredRowModel(),
    filterFns: {
        includesString: filterFn_includesString,
    },
})

const columns: Array<ColumnDef<typeof features, IssuanceNormHeaderExpanded, unknown>> = [
    {
        accessorKey: "position",
        header: "Должность",
        cell: ({ row }) => row.original.expand?.position?.name ?? "Не указана",
    },
    {
        accessorKey: "name",
        header: "Название нормы",
        cell: ({ row }) => row.original.name,
    },
    {
        accessorKey: "condition",
        header: "Условие нормы",
        cell: ({ row }) => row.original.condition || "—",
    },
    {
        accessorKey: "norm_point",
        header: "Пункт норм",
        cell: ({ row }) => row.original.norm_point || "—",
    },
    {
        accessorKey: "comment",
        header: "Комментарий",
        cell: ({ row }) => row.original.comment || "—",
    },
];

export const IssuanceNormsTable = () => {

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [issuanceNorms, setIssuanceNorms] = useState<Array<IssuanceNormHeaderExpanded>>([])
    const [selectedIssuanceNormId, setSelectedIssuanceNormId] = useState<string | null>(null);

    const handleClick = (id: string | null) => {
        setSelectedIssuanceNormId(id);
    }

    const issuanceNormFind = issuanceNorms.find(issuanceNorm => issuanceNorm.id === selectedIssuanceNormId)

    const loadIssuanceNorms = async ()  => {
        try {
            const data = await getIssuanceNormHeaders()
            setIssuanceNorms(data)
        } catch (error) {
            console.error('Ошибка загрузки сотрудников:', error);
            message.warning('Включен Strict mode: Нормы выдачи');
        }
    }

    useEffect(() => {
        loadIssuanceNorms()
    }, []);

    const table = useTable({
        key: 'IssuanceNorms-table',
        features,
        columns,
        data: issuanceNorms,
        state: {
            columnFilters
        },
        onColumnFiltersChange: setColumnFilters

    })

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColumnFilters([
            {
                id: 'name',
                value: e.target.value
            }
        ])
    }

    const onClose = () => {
        setSelectedIssuanceNormId(null)
    }

    return (
        <div>
            <IssuanceNormRecord
                selectedIssuanceNormId={selectedIssuanceNormId}
                onClose={onClose}
                issuanceNorm={issuanceNormFind}
            />
            <IssuanceNormModal loadIssuanceNorms={loadIssuanceNorms}/>
            <Input
                onChange={handleSearchChange}
                className={'m-3 w-102'}
                size="large"
                placeholder="Поиск по ФИО"
                prefix={<UserOutlined />}

            />
            <ImportEmployees />

            <div className={'w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm m-3'}>
                <table className={'w-full min-w-[600px] border-collapse text-left text-sm'}>
                    <thead className={'bg-gray-100 text-xs uppercase tracking-wider text-gray-600'}>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} >
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} className={'px-4 py-3 font-semibold border-b border-gray-200'}>
                                    {header.isPlaceholder ? null : (
                                        <table.FlexRender header={header} />
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody className={'divide-y divide-gray-200'}>
                    {table.getRowModel().rows.map((row, index) => (
                        <tr key={row.id}
                            onClick={() => handleClick(row.original.id)}
                            className={`transition-colors hover:bg-blue-50/60 ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                            }`}>
                            {row.getAllCells().map((cell) => (
                                <td key={cell.id} className={'px-4 py-3 text-gray-700'}>
                                    <table.FlexRender cell={cell} />
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}