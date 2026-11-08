import {Drawer, Input, message, Table} from "antd";
import {useEffect, useState} from "react";
import type {Division} from "../../types/divisions.ts";
import {getDivisions} from "../../hooks/useDivisions.tsx";
import { DivisionCard } from "./DivisionCard.tsx";
import {getPositions, type Position} from "../../hooks/usePositions.tsx";
import {getContractPositions} from "../../hooks/useContractPositions.tsx";
import type {ContractPosition} from "../../types/contractPositions.ts";


export const DivisionsTable = () => {

    const [divisions, setDivisions] = useState<Division[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("");
    const [selectDivision, setSelectedDivision] = useState<Division | null>(null);

    const [allPpePositions, setAllPpePositions] = useState<Position[]>([]);
    const [allContractPositions, setAllContractPositions] = useState<ContractPosition[]>([]);

    const loadDivisions = async () => {
        setLoading(true)
        try {
            const ppePositions = await getPositions()
            const contractPostitions = await getContractPositions()
            const divisions = await getDivisions();
            setDivisions(divisions)
            setAllContractPositions(contractPostitions)
            setAllPpePositions(ppePositions)

        } catch (error) {
            message.error('Ошибка загрузки данных')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {

        void loadDivisions()
    },[])

    const handleDivisionUpdated = (updatedDivision: Division) => {
        setSelectedDivision(updatedDivision);

        setDivisions((prev) =>
            prev.map((division) =>
                division.id === updatedDivision.id
                    ? updatedDivision
                    : division
            )
        );
    };

    const columns = [
        {
            title: 'Подразделение',
            dataIndex: 'name',
            key: 'name',
        },
    ];

    const filteredDivisions = divisions.filter((division) =>
        division.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <>
            <Input
                placeholder="Поиск по подразделению"
                style={{marginBottom: 16,maxWidth: 360}}
                variant={"underlined"}
                onChange={(e) => setSearch(e.target.value)}
            />
            <Table
                rowKey="id"
                dataSource={filteredDivisions}
                columns={columns}
                pagination={false}
                loading={loading}
                onRow={(record) => ({
                    onClick: () => setSelectedDivision(record),
                    style: { cursor: "pointer" },

                })}
            />
            <Drawer
                open={selectDivision !== null}
                onClose={() => setSelectedDivision(null)}
                size={1000}
                title={selectDivision?.name}
            >
                {selectDivision && <DivisionCard
                    selectDivision={selectDivision}
                    allPpePositions={allPpePositions}
                    allContractPositions={allContractPositions}
                    onDivisionUpdated={handleDivisionUpdated}
                />}
            </Drawer>
        </>
    )
}