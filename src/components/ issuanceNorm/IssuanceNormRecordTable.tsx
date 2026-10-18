import {
    type ColumnDef,
    columnFilteringFeature, type ColumnFiltersState,
    createFilteredRowModel,
    filterFn_includesString,
    tableFeatures, useTable
} from "@tanstack/react-table";
import type {IssuanceNormExpanded, IssuanceNormHeaderExpanded} from "../../types/norms.ts";
import {useCallback, useEffect, useState} from "react";
import {deleteIssuanceNorm, getIssuanceNormItems} from "../../hooks/useIssuanceNorms.tsx";
import {Button, type CheckboxProps, Divider, Input, message} from "antd";
import Checkbox from "antd/es/checkbox/Checkbox";
import {IssuanceNormRecordModal} from "./createModal/IssuanceNormRecordModal.tsx";
import Text from "antd/es/typography/Text";


const features = tableFeatures({
    columnFilteringFeature,
    filteredRowModel: createFilteredRowModel(),
    filterFns: {
        includesString: filterFn_includesString,
    },
})




type IssuanceNormRecordTableProps = {
    issuanceNorm: IssuanceNormHeaderExpanded | undefined;
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
    }

    const columns: Array<ColumnDef<typeof features, IssuanceNormExpanded, unknown>> = [
        {
            accessorKey: "create",
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
            id: 'nomenclature',
            accessorFn: (row) => row.expand?.nomenclature?.name ?? '',
            header: 'Наименование СИЗ',
            filterFn: 'includesString',
            cell: ({ row }) => row.original.expand?.nomenclature?.name ?? 'Не указано',
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

    const loadIssuanceNorms = useCallback(async () => {
        if (!issuanceNorm?.id) {
            setIssuanceNorms([]);
            return;
        }

        try {
            console.log("ID выбранной нормы:", issuanceNorm.id);
            const data = await getIssuanceNormItems(issuanceNorm.id);
            console.log("Данные для таблицы:", data);
            setIssuanceNorms(data);
        } catch (error) {
            console.error('Ошибка загрузки записей нормы:', error);
            message.error('Не удалось загрузить записи нормы');
            setIssuanceNorms([]);
        }
    }, [issuanceNorm?.id]);

    useEffect(() => {
        setSelectedIds([]);
        setColumnFilters([]);
        void loadIssuanceNorms();
    }, [loadIssuanceNorms]);



    const handleDeleteIssuanceNorm = async (ids: string[]) => {
        if(ids.length === 0){
            message.warning('Выбери записи для удаления')
            setSelectedIds([])
            return
        }

        try {
            for (const id of ids) {
                await deleteIssuanceNorm(id);
            }

            message.success("Выбранные записи удалены");
        } catch (error) {
            console.error("Ошибка удаления записей:", error);
            message.error("Не удалось удалить все выбранные записи");
        } finally {
            setSelectedIds([]);
            await loadIssuanceNorms();
        }

    }



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
            <div className={'grid grid-cols-2 gap-4'}>
                <div className={'flex flex-col'}>
                    <Text strong>Наименование нормы</Text>
                    <Text>{issuanceNorm?.name}</Text>
                </div>
                <div className={'flex flex-col'}>
                    <Text strong>Период</Text>
                    <Text>{issuanceNorm?.period_months}</Text>
                </div>
                <div className={'flex flex-col'}>
                    <Text strong>Подразделение</Text>
                    <Text>{issuanceNorm?.expand?.position?.name}</Text>
                </div>
                <div className={'flex flex-col'}>
                    <Text strong>Условие нормы</Text>
                    <Text>{issuanceNorm?.condition}</Text>
                </div>
                <div className={'flex flex-col'}>
                    <Text strong>Пункт норм</Text>
                    <Text>{issuanceNorm?.norm_point}</Text>
                </div>
                <div className={'flex flex-col'}>
                    <Text strong>Комментарий</Text>
                    <Text>{issuanceNorm?.comment}</Text>
                </div>
            </div>

            <Divider/>

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
                <IssuanceNormRecordModal issuanceNorm={issuanceNorm}/>
                <Button
                    onClick={() => handleDeleteIssuanceNorm(selectedIds)}
                    danger
                >
                    Удалить
                </Button>
            </div>
        </div>
    )
}