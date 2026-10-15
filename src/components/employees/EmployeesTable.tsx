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
import {ImportEmployees} from "./ImportEmployees.tsx";
import {EmployeeModal} from "./EmployeeModal.tsx";
import {getEmployes} from "../../hooks/useEmployess.tsx";
import {EmployeeRecord} from "./EmployeeRecord.tsx";

type Employees = {
    id: string;
    fullName: string
    position: string
    unit: string
    personnelNumber: string
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
        accessorKey: 'personnelNumber',
        header: 'Таб №.',
        cell: (info) => info.getValue(),
    },
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
        accessorKey: `editing`,
        header: () => <EditTwoTone />,
        cell: () => <ActionsCell/>,
    },
    {
        accessorKey: `comment`,
        header: 'Комментарий',
        cell: (info) => info.getValue(),
    },
]

export const EmployeesTable = () => {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [employees, setEmployees] = useState<Array<Employees>>([])
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

    const handleClick = (id: string | null) => {
            setSelectedEmployeeId(id);

    }

    const loadEmployees = async ()  => {
        try {
            const data = await getEmployes()
            setEmployees(data)
        } catch (error) {
            console.error('Ошибка загрузки сотрудников:', error);
            message.warning('Включен Strict mode: Сотрудники');
        }
    }

    useEffect(() => {
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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColumnFilters([
            {
                id: 'fullName',
                value: e.target.value
            }
        ])
    }

    const onClose = () => {
        setSelectedEmployeeId(null)
    }

    return (
        <div>
            <EmployeeRecord
                selectedEmployeeId={selectedEmployeeId}
                onClose={onClose}
            />
            <EmployeeModal loadEmployees={loadEmployees}/>
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