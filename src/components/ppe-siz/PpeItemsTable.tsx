import {Input, message} from "antd";
import {UserOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import {
    type ColumnDef,
    columnFilteringFeature,
    type ColumnFiltersState,
    createFilteredRowModel, filterFn_includesString,
    tableFeatures,
    useTable
} from "@tanstack/react-table";
import {getPpeItems} from "../../hooks/usePpeItems.tsx";
import {PpeItemModal} from "./PpeItemModal.tsx";
import {ImportPpeItems} from "./ImportPpeItems.tsx";


type PpeItem = {
    id: string;
    created: string;
    updated: string;
    name: string;
    category: string;
    unit: string;
    description: string
    isActive: boolean;
}

const features = tableFeatures({
    columnFilteringFeature,
    filteredRowModel: createFilteredRowModel(),
    filterFns: {
        includesString: filterFn_includesString,
    },
})

const columns: Array<ColumnDef<typeof features, PpeItem, unknown>> = [
    {
        accessorKey: 'name',
        header: 'Наименование СИЗ',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: 'category',
        header: 'Категория',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: 'unit',
        header: 'Ед. изм.',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: 'description',
        header: 'Описание',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: `isActive`,
        header: 'Статус',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: `editing`,
        header: 'Действия',
        cell: (info) => info.getValue(),
    },
]

export const PpeItemsTable = ()=>{
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [ppeItems, setPpeItems] = useState<Array<PpeItem>>([])

    const loadPpeItems = async ()  => {
        try {
            const data = await getPpeItems()
            setPpeItems(data)
        } catch (error) {
            console.error('Ошибка загрузки СИЗ:', error);
            message.warning('Включен Strict mode: СИЗы');
        }
    }

    useEffect(() => {
        loadPpeItems()
    }, []);

    const table = useTable({
        key: 'ppeItems-table',
        features,
        columns,
        data: ppeItems,
        state: {
            columnFilters
        },
        onColumnFiltersChange: setColumnFilters

    })

    const handleSearchChange = (e) => {
        setColumnFilters([
            {
                id: 'fullName',
                value: e.target.value
            }
        ])
    }

    return (
        <div>
            <PpeItemModal loadPpeItems={loadPpeItems}/>
            <Input
                onChange={handleSearchChange}
                className={'m-3 w-102'}
                size="large"
                placeholder="Поиск по наименованию..."
                prefix={<UserOutlined />}

            />
            <ImportPpeItems />
            <div className={'w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm m-3'}>
                <table className={'w-full min-w-[600px] border-collapse text-left text-sm'}>
                    <thead className={'bg-gray-100 text-xs uppercase tracking-wider text-gray-600'}>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
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
                        <tr key={row.id} className={`transition-colors hover:bg-blue-50/60 ${
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