import {
    type ColumnDef,
    columnFilteringFeature, type ColumnFiltersState,
    createFilteredRowModel,
    filterFn_includesString,
    tableFeatures, useTable
} from "@tanstack/react-table";
import type {IssuanceNormExpanded} from "../../types/norms.ts";
import {useEffect, useState} from "react";
import {deleteIssuanceNorm, getIssuanceNorm} from "../../hooks/useIssuanceNorms.tsx";
import {Button, type CheckboxProps, Input, message} from "antd";
import Checkbox from "antd/es/checkbox/Checkbox";


const features = tableFeatures({
    columnFilteringFeature,
    filteredRowModel: createFilteredRowModel(),
    filterFns: {
        includesString: filterFn_includesString,
    },
})




type IssuanceNormRecordTableProps = {
    issuanceNorm: IssuanceNormExpanded | undefined;
}

export const IssuanceNormRecordTable = ({issuanceNorm}: IssuanceNormRecordTableProps) => {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [issuanceNorms, setIssuanceNorms] = useState<Array<IssuanceNormExpanded>>([])
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const handleChange = (e: Parameters<NonNullable<CheckboxProps['onChange']>>[0], id: string) => {

        if(e.target.checked) {
            setSelectedIds(prev => prev.includes(id) ? prev : [...prev, id])
        } else {
            setSelectedIds(prev => prev.filter(selectetId => selectetId !== id))
        }

        console.log(selectedIds)
    }

    const columns: Array<ColumnDef<typeof features, IssuanceNormExpanded, unknown>> = [
        {
            accessorKey: "id",
            header: "Чекбокс",
            cell: ({row}) => {
                const id = row.original.id
                    return (
                        <Checkbox
                            checked={selectedIds.includes(id)}
                            onChange={(e) => handleChange(e, id)}
                        />
                        )
            }

        },
        {
            accessorKey: "nomenclature",
            header: "Наименование СИЗ",
            cell: ({ row }) =>
                row.original.expand?.nomenclature?.name ?? "Не указано",
        },
        {
            accessorKey: "quantity",
            header: "Количество",
            cell: (info) => info.getValue(),
        },
        {
            accessorKey: "period_months",
            header: "Период, мес.",
            cell: (info) => info.getValue(),
        },
        {
            accessorKey: "estimated_cost",
            header: "Расчётная стоимость",
            cell: (info) => info.getValue(),
        },
        {
            accessorKey: "comment",
            header: "Комментарий",
            cell: (info) => info.getValue(),
        },
    ]


    const loadIssuanceNorms = async ()  => {
        if(issuanceNorm === undefined) return

        try {
            const data = await getIssuanceNorm(issuanceNorm.position)
            setIssuanceNorms(data)
        } catch (error) {
            console.error('Ошибка загрузки сотрудников:', error);
            message.warning('Включен Strict mode: Сотрудники');
        }
    }

    const handleDeleteIssuanceNorm = async (ids: string[]) => {
        if(ids.length === 0){
            message.warning('Выбери записи для удаления')
            return
        }

        try {
            for (const id of ids) {
                await deleteIssuanceNorm(id)
            }

            message.success("Выбранные записи удалены");

            await loadIssuanceNorms()
            setSelectedIds([])
        } catch (error) {
            message.error("Ошибка удаления записей")
            await loadIssuanceNorms();
        }

    }

    useEffect(() => {
        loadIssuanceNorms()
    }, [issuanceNorm]);

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
                id: 'nomenclature',
                value: e.target.value
            }
        ])
    }


    return (
        <div>
            <Input
                onChange={handleSearchChange}
                className={'m-3 w-102'}
                size="large"
                placeholder="Поиск"
            />
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
            <div className={'flex flex-row gap-3'}>
                <Button variant={'outlined'} color={'blue'}>Добавить</Button>
                <Button onClick={() => handleDeleteIssuanceNorm(selectedIds)} danger>Удалить</Button>
            </div>
        </div>
    )
}