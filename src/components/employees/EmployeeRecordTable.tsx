import {
    type ColumnDef,
    columnFilteringFeature, type ColumnFiltersState,
    createFilteredRowModel,
    filterFn_includesString,
    tableFeatures, useTable
} from "@tanstack/react-table";
import {useEffect, useState} from "react";
import {message} from "antd";
import {getIssuanceNorm} from "../../hooks/useIssuanceNorms.tsx";
import type {IssuanceNormExpanded} from "../../types/norms.ts";

const features = tableFeatures({
    columnFilteringFeature,
    filteredRowModel: createFilteredRowModel(),
    filterFns: {
        includesString: filterFn_includesString,
    },
})

const columns: Array<ColumnDef<typeof features, IssuanceNormExpanded, unknown>> = [
    {
        accessorKey: 'nomenclature',
        header: 'Наименование СИЗ',
        cell: ({ row }) =>
            row.original.expand?.nomenclature?.name ?? 'Не указано',
    },
    {
        accessorKey: 'quantity',
        header: 'Количество',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: 'period_months',
        header: 'Период, мес.',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: 'estimated_cost',
        header: 'Расчётная стоимость',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: 'comment',
        header: 'Комментарий',
        cell: (info) => info.getValue(),
    },
]

type EmployeeRecordTableProps = {
    positionId?: string;
}

export const EmployeeRecordTable = ({positionId}: EmployeeRecordTableProps ) => {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [issuanceNorms, setIssuanceNorms] = useState<Array<IssuanceNormExpanded>>([])

    const loadIssuanceNorms = async ()  => {
        if(!positionId) {
            setIssuanceNorms([])
            return
        }

        try {
            const data = await getIssuanceNorm(positionId)
            setIssuanceNorms(data)
        } catch (error) {
            console.error('Ошибка загрузки норм:', error);
            message.warning('Включен Strict mode: Нормы выдачи');
        }
    }

    useEffect(() => {
        loadIssuanceNorms()
    }, [positionId]);

    const table = useTable({
        key: 'employeeRecord-table',
        features,
        columns,
        data: issuanceNorms,
        state: {
            columnFilters
        },
        onColumnFiltersChange: setColumnFilters

    })

    return (
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
    )
}