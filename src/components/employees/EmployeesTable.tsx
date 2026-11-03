import {UserOutlined} from "@ant-design/icons";
import {useState} from "react";
import {Input, Table, Tag} from "antd";
import {EmployeeRecord} from "./EmployeeRecord.tsx";
import type {Employee} from "../../types/employee.ts";

const formatDate = (date: string) => {
    if (!date) return "Не указано";

    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
};

const columns = [
    {
        title: "Табельный номер",
        dataIndex: "personnelNumber",
        key: "personnelNumber",
    },
    {
        title: 'ФИО',
        dataIndex: 'fullName',
        key: 'fullName',
    },
    {
        title: 'Подразделение',
        dataIndex: 'division',
        key: 'division',
        render: (_: unknown, record: Employee) => {
            return record.expand?.division?.name ?? 'Не указано'
        }
    },
    {
        title: 'Должность по трудовому договору',
        dataIndex: 'contractPosition',
        key: 'contractPosition',
        render: (_: unknown, record: Employee) => {
            return record.expand?.contractPosition?.name ?? 'Не указано'
        }
    },
    {
        title: 'Должность по СИЗ',
        dataIndex: 'positionRelation',
        key: 'positionRelation',
        render: (_: unknown, record: Employee) => {
            return record.expand?.positionRelation?.name ?? 'Не указано'
        }
    },
    {
        title: 'Обновлено',
        dataIndex: 'updated',
        key: 'updated',
        render: (_: unknown, record: Employee) => {
            return (
                <Tag variant={"filled"} color={"purple"}>
                    {formatDate(record.updated) ?? 'Не указано'}
                </Tag>)
        }
    },
    {
        title: 'Комментарий',
        dataIndex: 'comment',
        key: 'comment',
        render: (_: unknown, record: Employee) => {
            return record.comment ?? 'Не указано'
        }
    },
];

interface EmployeesTableProps {
    employees: Employee[];
}

export const EmployeesTable = ({employees}: EmployeesTableProps) => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

    const [search, setSearch] = useState('')

    const employee = employees.find(employee => employee.id === selectedEmployeeId)

    const onClose = () => {
        setSelectedEmployeeId(null)
    }

    const filteredEmployees = employees.filter((employee) =>
        employee.fullName.toLowerCase().includes(search.toLowerCase()))

    return (
        <div>
            <EmployeeRecord
                selectedEmployeeId={selectedEmployeeId}
                onClose={onClose}
                employee={employee}
            />

            <Input
                className={'m-3 w-102'}
                size="large"
                placeholder="Поиск по ФИО"
                prefix={<UserOutlined />}
                variant={"underlined"}
                onChange={(e) => setSearch(e.target.value)}
            />

            <Table
                columns={columns}
                dataSource={filteredEmployees}
                onRow={(record) => ({
                    onClick: () => {setSelectedEmployeeId(record.id)},
                    style: { cursor: "pointer" },
                })}
            />
        </div>
    )
}