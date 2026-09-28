import {type ColumnDef, tableFeatures, useTable} from "@tanstack/react-table";
import {EditTwoTone} from "@ant-design/icons";
import {ActionsCell} from "./ActionsCell.tsx";

type Employees = {
    fullName: string
    position: string
    unit: string
    id: string
}

const data: Array<Employees> = [
    { fullName: 'Евгений Евгеньевич Евген', position: 'Печатник 3-го разряда', unit: 'Цех №1', id: '13413' },
    { fullName: 'Иванов Иван Иванович', position: 'Начальник цеха', unit: 'Цех №1', id: '13414' },
    { fullName: 'Петрова Анна Сергеевна', position: 'Бухгалтер', unit: 'Бухгалтерия', id: '13415' },
    { fullName: 'Сидоров Пётр Алексеевич', position: 'Слесарь-ремонтник 4-го разряда', unit: 'Ремонтный участок', id: '13416' },
    { fullName: 'Кузнецова Мария Владимировна', position: 'Инженер-технолог', unit: 'Технологический отдел', id: '13417' },
    { fullName: 'Смирнов Алексей Николаевич', position: 'Оператор станка ЧПУ', unit: 'Цех №2', id: '13418' },
    { fullName: 'Волкова Ольга Дмитриевна', position: 'Начальник отдела кадров', unit: 'Отдел кадров', id: '13419' },
    { fullName: 'Козлов Дмитрий Андреевич', position: 'Электромонтёр 5-го разряда', unit: 'Электроцех', id: '13420' },
    { fullName: 'Морозова Екатерина Игоревна', position: 'Кладовщик', unit: 'Склад', id: '13421' },
    { fullName: 'Никитин Роман Олегович', position: 'Водитель погрузчика', unit: 'Транспортный участок', id: '13422' },
    { fullName: 'Фёдорова Татьяна Павловна', position: 'Уборщик производственных помещений', unit: 'Цех №2', id: '13423' },
    { fullName: 'Егоров Сергей Викторович', position: 'Наладчик оборудования', unit: 'Цех №1', id: '13424' },
]

const features = tableFeatures({})

const columns: Array<ColumnDef<typeof features, Employees>> = [
    {
        accessorKey: 'fullName',
        header: 'ФИО',
        cell: (info) => info.getValue(),
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
    const table = useTable({
        key: 'employees-table',
        features,
        columns,
        data,
    })

    return (
        <div className={'w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm'}>
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

    )
}