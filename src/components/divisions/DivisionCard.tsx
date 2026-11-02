import type {Division} from "../../types/divisions.ts";
import {Button, Descriptions, type DescriptionsProps, message, Select, Tag} from "antd";
import {useState} from "react";
import type {ContractPosition} from "../../types/contractPositions.ts";
import type {Position} from "../../hooks/usePositions.tsx";
import {updateDivisions} from "../../hooks/useDivisions.tsx";

interface DivisionCardProps {
    selectDivision: Division
    allContractPositions: ContractPosition[]
    allPpePositions: Position[]
    onDivisionUpdated: (division: Division) => void;
}

export const DivisionCard = ({selectDivision, allPpePositions, allContractPositions, onDivisionUpdated}: DivisionCardProps) => {

    const [isEditing, setIsEditing] = useState<boolean>(false);

    const [ppePosition, setPpePosition] = useState<string[]>(selectDivision.ppe_positions ?? []);

    const [contractPosition, setContractPosition] = useState<string[]>(selectDivision.contract_positions ?? []);

    const formattedDate = new Date(selectDivision.updated).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const handleCancel = () => {
        setContractPosition(selectDivision.contract_positions ?? [])
        setPpePosition(selectDivision.ppe_positions ?? [])
        setIsEditing(false);
    }

    const handleSave = async () => {
        try {
            const updatedDivision = await updateDivisions(selectDivision.id, {
                ppe_positions: ppePosition,
                contract_positions: contractPosition,
            })
            onDivisionUpdated(updatedDivision);

            setIsEditing(false);
        } catch (error) {
            message.error('Ошибка сохранения')
        }
    }

    const items: DescriptionsProps['items'] = [
        {
            key: '1',
            label: (<div className={'text-2xl'}>Должность по СИЗ</div>),
            children: (
                <ul className={'flex flex-col gap-1'}>
                    {selectDivision.expand?.ppe_positions
                    ?.map((division) => (
                       <li
                           key={division.id}
                       >
                           <Tag color={'blue-inverse'} variant={'outlined'} className={'text-lg'}>
                               {division.name}
                           </Tag>

                       </li>
                    ))
                    || <li>Не указаны</li>}
                </ul>  )
        },
        {
            key: '2',
            label: (<div className={'text-2xl'}>Должность по трудовому договору</div>),
            children: (
                <ul className={'flex flex-col gap-1'}>
                    {selectDivision.expand?.contract_positions?.map((item) => (
                        <li key={item.id}>
                            <Tag color={"cyan"} variant={"outlined"} className={'text-lg'}>
                                {item.name}
                            </Tag>
                        </li>
                    )) || <li>Не указаны</li>}
                </ul>
            ),
        },
    ];

    return (
        <div className={'flex flex-col gap-10'}>
            <div className={'flex justify-end'}>
                <Tag>Изменено: {formattedDate}</Tag>
            </div>

            {isEditing ? (
               <div className={'flex flex-col gap-2'}>
                   <div>
                       <label>Должность по СИЗ</label>
                       <Select
                            mode={'multiple'}
                            className={'w-full'}
                            value={ppePosition}
                            onChange={setPpePosition}
                            options={allPpePositions.map((ppePosition) => ({
                                label: ppePosition.name,
                                value: ppePosition.id,
                            }))}
                       />
                   </div>

                   <div>
                       <label>Должность по трудовому договору</label>
                       <Select
                           mode={'multiple'}
                           className={'w-full'}
                           value={contractPosition}
                           onChange={setContractPosition}
                           options={allContractPositions.map((contractPosition) => ({
                               label: contractPosition.name,
                               value: contractPosition.id,
                           }))}
                       />
                   </div>

               </div>
            ) : (<Descriptions
                items={items}
                layout={"vertical"}
                column={1}
            />)
            }

            <div className={'flex justify-end gap-1'}>
                {isEditing ? (
                    <>
                        <Button onClick={handleCancel}>Отмена</Button>
                        <Button onClick={handleSave}>Сохранить</Button>
                    </>

                ) : (
                    <Button onClick={() => setIsEditing(true)}>Редактировать</Button>
                    )
                }

            </div>
        </div>
    )
}