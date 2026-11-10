import {EmployeesTable} from "../components/employees/EmployeesTable.tsx";
import {EmployeeModal} from "../components/employees/EmployeeModal.tsx";
import type {Employee} from "../types/employee.ts";
import {ImportEmployees} from "../components/employees/ImportEmployees.tsx";
import {employeesKey, useEmployees} from "../hooks/useEmployess.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {useContractPositions} from "../hooks/useContractPositions.tsx";
import {useDivisions} from "../hooks/useDivisions.tsx";
import {usePpeIssuanceStandards} from "../hooks/usePpeIssuanceStandards.tsx";
import {usePpePositions} from "../hooks/usePositions.tsx";

export const PageEmployees = () => {
    const {
        data: employees = [],
        isLoading: employeesLoading,
        isError: employeesIsError,
        error: employeesError,
    } = useEmployees()

    const {
        data: allContractPositions = [],
        isLoading: allContractPositionsLoading,
    } = useContractPositions()

    const {
        data: allDivisions = [],
        isLoading: allDivisionsLoading,
    } = useDivisions()

    const {
        data: ppeIssuanceStandards = [],
        isLoading: ppeIssuanceStandardsLoading,
    } = usePpeIssuanceStandards()

    const {
        data: allPpePositions = [],
        isLoading: ppePositionsLoading,
    } = usePpePositions()

    const loading =
        employeesLoading ||
        allContractPositionsLoading  ||
        allDivisionsLoading ||
        ppeIssuanceStandardsLoading ||
        ppePositionsLoading


    const queryClient = useQueryClient();

    const loadData = async () => {
        await queryClient.invalidateQueries({
            queryKey: employeesKey,
        })
    }

    const handleEmployeeUpdated = (updatedEmployee: Employee) => {
        queryClient.setQueryData<Employee[]>(
            employeesKey,
            (prev = []) =>
                prev.map(item =>
                    item.id === updatedEmployee.id
                        ? updatedEmployee
                        : item
                )
        );
    };


    if(employeesIsError){
        return (
            <div>
                Ошибка загрузки сотрудников: {employeesError.message}
            </div>
        )
    }

return (
    <div>
        <div className={'flex flex-row gap-3'}>
            <EmployeeModal
                loadData={loadData}
                allContractPositions={allContractPositions}
                allDivisions={allDivisions}
                allPpePositions={allPpePositions}

            />
            <ImportEmployees />
        </div>

        <EmployeesTable
            ppeIssuanceStandards={ppeIssuanceStandards}
            employees={employees}
            loadData={loadData}
            handleEmployeeUpdated={handleEmployeeUpdated}
            allContractPositions={allContractPositions}
            allPpePositions={allPpePositions}
            allDivisions={allDivisions}
        />
        {loading && (
            <div className={'text-gray-500 mt-2'}>
                Загрузка данных...
            </div>
        )}
    </div>
)
}