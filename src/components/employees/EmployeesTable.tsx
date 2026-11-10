import {UserOutlined} from "@ant-design/icons";
import {useState} from "react";
import {Input, Table, Tag} from "antd";
import {EmployeeRecord} from "./EmployeeRecord.tsx";
import type {Employee} from "../../types/employee.ts";
import type {PpeIssuanceStandardExpanded} from "../../types/ppeIssuanceStandards.ts";
import type {ContractPosition} from "../../types/contractPositions.ts";
import type {Division} from "../../types/divisions.ts";
import type {Position} from "../../api/ppePositions.api.ts";

const formatDateUpdate = (date: string) => {
    if (!date) return;

    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
};

const formatDateOfEmployment = (date: string) => {
    if(!date) return;

    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(date));
}


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
                    {formatDateUpdate(record.updated) ?? 'Не указано'}
                </Tag>)
        }
    },
    {
        title: 'Дата приема на работу',
        dataIndex: 'date_of_employment',
        key: 'date_of_employment',
        render: (_: unknown, record: Employee) => {
            return (
                <Tag variant={"filled"} color={"pink"}>
                    {formatDateOfEmployment(record.date_of_employment) ?? 'Не указано'}
                </Tag>
            )
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
    loadData: () => void;
    ppeIssuanceStandards?: PpeIssuanceStandardExpanded[];
    handleEmployeeUpdated: (employee: Employee) => void;
    allContractPositions?: ContractPosition[];
    allPpePositions: Position[];
    allDivisions: Division[];
}

export const EmployeesTable = ({
                                   employees,
                                   loadData,
                                   ppeIssuanceStandards,
                                   handleEmployeeUpdated,
                                   allContractPositions,
                                   allPpePositions,
                                   allDivisions}: EmployeesTableProps) => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

    const [search, setSearch] = useState('')

    const employee = employees.find(employee => employee.id === selectedEmployeeId)

    const onClose = () => {
        setSelectedEmployeeId(null)
    }

    const filteredEmployees = employees.filter((employee) =>
        employee.fullName.toLowerCase().includes(search.toLowerCase()))

    const handleEmployeeDelete = () => {
        loadData()
    }

    return (
        <div>
            <EmployeeRecord
                selectedEmployeeId={selectedEmployeeId}
                onClose={onClose}
                employee={employee}
                onDelete={handleEmployeeDelete}
                ppeIssuanceStandards={ppeIssuanceStandards}
                onEmployeeUpdated={handleEmployeeUpdated}
                allContractPositions={allContractPositions}
                allPpePositions={allPpePositions}
                allDivisions={allDivisions}
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
                rowKey={'id'}
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