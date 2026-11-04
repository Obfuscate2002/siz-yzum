import {EmployeesTable} from "../components/employees/EmployeesTable.tsx";
import {useEffect, useState} from "react";
import {message} from "antd";
import type {ContractPosition} from "../types/contractPositions.ts";
import {getContractPositions} from "../hooks/useContractPositions.tsx";
import type {Division} from "../types/divisions.ts";
import {getDivisions} from "../hooks/useDivisions.tsx";
import {EmployeeModal} from "../components/employees/EmployeeModal.tsx";
import {getEmployes} from "../hooks/useEmployess.tsx";
import type {Employee} from "../types/employee.ts";
import {ImportEmployees} from "../components/employees/ImportEmployees.tsx";
import {getPpeIssuanceStandards} from "../hooks/usePpeIssuanceStandards.tsx";
import type {PpeIssuanceStandardExpanded} from "../types/ppeIssuanceStandards.ts";

export const PageEmployees = () => {
    const [loading, setLoading] = useState(false);
    const [allContractPositions, setAllContractPositions] = useState<ContractPosition[]>([]);
    const [allDivisions, setAllDivisions] = useState<Division[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([])
    const [ppeIssuanceStandards, setPpeIssuanceStandards] = useState<PpeIssuanceStandardExpanded[]>()

    const handleEmployeeUpdated = (updatedEmployee: Employee) => {
        setEmployees(prev => prev.map(item => item.id === updatedEmployee.id ? updatedEmployee : item));
    }

    const loadData = async () => {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                getEmployes(),
                getDivisions(),
                getContractPositions(),
                getPpeIssuanceStandards()
            ]);

            const [employeesResult, divisionsResult, positionsResult, ppeIssuanceStandardResult] = results;

            if (employeesResult.status === "fulfilled") {
                setEmployees(employeesResult.value);
            } else {
                console.error("Ошибка сотрудников:", employeesResult.reason);
            }

            if (divisionsResult.status === "fulfilled") {
                setAllDivisions(divisionsResult.value);
            } else {
                console.error("Ошибка подразделений:", divisionsResult.reason);
            }

            if (positionsResult.status === "fulfilled") {
                setAllContractPositions(positionsResult.value);
            } else {
                console.error("Ошибка должностей:", positionsResult.reason);
            }
            if (ppeIssuanceStandardResult.status === "fulfilled") {
                setPpeIssuanceStandards(ppeIssuanceStandardResult.value);
            } else {
                console.error("Ошибка норм выдачи СИЗ:", ppeIssuanceStandardResult.reason);
            }

        } catch (error) {
            console.error("Ошибка загрузки:", error);
            message.error("Не удалось загрузить данные");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadData();
    }, [loading]);


return (
    <div>
        <div className={'flex flex-row gap-3'}>
            <EmployeeModal
                loadData={loadData}
                allContractPositions={allContractPositions}
                allDivisions={allDivisions}

            />
            <ImportEmployees />
        </div>

        <EmployeesTable
            ppeIssuanceStandards={ppeIssuanceStandards}
            employees={employees}
            loadData={loadData}
            handleEmployeeUpdated={handleEmployeeUpdated}
            allContractPositions={allContractPositions}
        />
    </div>
)
}