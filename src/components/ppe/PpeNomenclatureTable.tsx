import {
    type ColumnDef,
    columnFilteringFeature, type ColumnFiltersState,
    createFilteredRowModel,
    filterFn_includesString,
    tableFeatures, useTable
} from "@tanstack/react-table";
import {useEffect, useState} from "react";
import {Input, message} from "antd";
import {UserOutlined} from "@ant-design/icons";
import {getPpeNomenclatures} from "../../hooks/usePpeNomenclature.tsx";
import {PpeNomenclaturesModal} from "./PpeNomenclaturesModal.tsx";
import {ImportPpeNomenclatures} from "./ImportPpeNomenclatures.tsx";

type PpeNomenclature = {
    id: string;
    name: string;
    number: string;
    type: string;
    gender: 'Мужской' | 'Женский' | 'Универсальный';
    is_archived: boolean;
    use_barcode: boolean;
    barcode: string;
    comment: string;
};

const features = tableFeatures({
    columnFilteringFeature,
    filteredRowModel: createFilteredRowModel(),
    filterFns: {
        includesString: filterFn_includesString,
    },
})

const columns: Array<ColumnDef<typeof features, PpeNomenclature, unknown>> = [
    {
        accessorKey: 'number',
        header: '№',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: 'name',
        header: 'Наименование',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: 'type',
        header: 'Тип номенклатуры',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: 'gender',
        header: 'Пол',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: `comment`,
        header: 'Комментарий',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: `editing`,
        header: 'Действия',
        cell: (info) => info.getValue(),
    },
]


export const PpeNomenclatureTable = () => {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [ppeNomenclatures, setPpeNomenclatures] = useState<Array<PpeNomenclature>>([])

    const loadPpeNomenclatures = async ()  => {
        try {
            const data = await getPpeNomenclatures()
            setPpeNomenclatures(data)
        } catch (error) {
            console.error('Ошибка загрузки СИЗ:', error);
            message.warning('Включен Strict mode: СИЗы');
        }
    }

    useEffect(() => {
        loadPpeNomenclatures()
    }, []);

    const table = useTable({
        key: 'ppeItems-table',
        features,
        columns,
        data: ppeNomenclatures,
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

    return (
        <div>
            <PpeNomenclaturesModal loadPpeNomenclatures={loadPpeNomenclatures}/>
            <Input
                onChange={handleSearchChange}
                className={'m-3 w-102'}
                size="large"
                placeholder="Поиск по наименованию..."
                prefix={<UserOutlined />}

            />
            <ImportPpeNomenclatures />
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