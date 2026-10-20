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
import {getPpeIssuanceStandards} from "../../hooks/usePpeIssuanceStandards.tsx";
import type {PpeIssuanceStandard} from "../../types/ppeIssuanceStandards.ts";
import {PpeIssuanceStandardRecord} from "./PpeIssuanceStandardRecord.tsx";
import {ImportPpeIssuanceStandards} from "./ImportPpeIssuanceStandard.tsx";
import {PpeIssuanceStandardModal} from "./PpeIssuanceStandardModal.tsx";

const features = tableFeatures({
    columnFilteringFeature,
    filteredRowModel: createFilteredRowModel(),
    filterFns: {
        includesString: filterFn_includesString,
    },
})

const columns: Array<ColumnDef<typeof features, PpeIssuanceStandard, unknown>> = [
    {
        accessorKey: 'position_name',
        header: 'Должность',
        cell: (info) => info.getValue(),
    },

]

export const PpeIssuanceStandardsTable = () => {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [ppeIssuanceStandards, setPpeIssuanceStandards] = useState<Array<PpeIssuanceStandard>>([])
    const [selectedPpeIssuanceStandardId, setSelectedPpeIssuanceStandardId] = useState<string | null>(null);

    const uniquePositions: PpeIssuanceStandard[] = Array.from(
        new Map(
            ppeIssuanceStandards.map((item) => [
                item.position_name?.trim().toLowerCase(),
                item
            ])
        ).values()
    );

    const handleClick = (id: string | null) => {
        setSelectedPpeIssuanceStandardId(id);
    }

    const ppeIssuanceStandard = ppeIssuanceStandards.find(employee => employee.id === selectedPpeIssuanceStandardId)

    const loadPpeIssuanceStandards = async ()  => {
        try {
            const data = await getPpeIssuanceStandards()
            setPpeIssuanceStandards(data)
        } catch (error) {
            console.error('Ошибка загрузки сотрудников:', error);
            message.warning('Включен Strict mode: Сотрудники');
        }
    }

    useEffect(() => {
        loadPpeIssuanceStandards()
    }, []);

    const table = useTable({
        key: 'ppeIssuanceStandards-table',
        features,
        columns,
        data: uniquePositions,
        state: {
            columnFilters
        },
        onColumnFiltersChange: setColumnFilters

    })

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColumnFilters([
            {
                id: 'fullName',
                value: e.target.value
            }
        ])
    }

    const onClose = () => {
        setSelectedPpeIssuanceStandardId(null)
    }

    return (
        <div>
            <PpeIssuanceStandardRecord
                selectedPpeIssuanceStandardId={selectedPpeIssuanceStandardId}
                onClose={onClose}
                ppeIssuanceStandard={ppeIssuanceStandard}
            />
            <PpeIssuanceStandardModal loadPpeIssuanceStandards={loadPpeIssuanceStandards}/>
            <Input
                onChange={handleSearchChange}
                className={'m-3 w-102'}
                size="large"
                placeholder="Поиск по ФИО"
                prefix={<UserOutlined />}

            />
            <ImportPpeIssuanceStandards />

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