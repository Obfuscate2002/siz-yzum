import {
    type ColumnDef, columnFilteringFeature,
    type ColumnFiltersState, createFilteredRowModel,
    filterFn_includesString,
    tableFeatures,
    useTable
} from "@tanstack/react-table";
import {EditTwoTone, UserOutlined} from "@ant-design/icons";
import {ActionsCell} from "./ActionsCell.tsx";
import {useEffect, useState} from "react";
import {Input, message} from "antd";
import {pb} from "../../pocketbase/pocketbase.ts";

type Employees = {
    fullName: string
    position: string
    unit: string
    personnelNumber: string
    id: string

}

const features = tableFeatures({
    columnFilteringFeature,
    filteredRowModel: createFilteredRowModel(),
    filterFns: {
        includesString: filterFn_includesString,
    },
})

const columns: Array<ColumnDef<typeof features, Employees, unknown>> = [
    {
        accessorKey: 'fullName',
        header: 'ФИО',
        cell: (info) => info.getValue(),
        filterFn: 'includesString',
    },
    {
        accessorKey: 'position',
        header: 'Должность',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: 'unit',
        header: 'Подразделение',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: 'id',
        header: 'Таб №.',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: `editing`,
        header: () => <EditTwoTone />,
        cell: () => <ActionsCell/>,
    }
]

export const EmployeesTable = () => {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [employees, setEmployees] = useState<Array<Employees>>([])

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                await pb.collection('users').authWithPassword('admin@siz-yzum.local', 'siz-yzum2026');

                const data = await pb.collection('employees').getFullList<Employees>();
                setEmployees(data)
            } catch (error) {
                message.error('Ошибка')
            }
        }
        loadEmployees()
    }, []);

    const table = useTable({
        key: 'employees-table',
        features,
        columns,
        data: employees,
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
            <Input
                onChange={handleSearchChange}
                className={'m-3 w-102'}
                size="large"
                placeholder="Поиск по ФИО"
                prefix={<UserOutlined />}

            />
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