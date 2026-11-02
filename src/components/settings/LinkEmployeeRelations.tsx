
import React, { useState } from "react";
import PocketBase from "pocketbase";
import { Button, Modal, message } from "antd";
import { LinkOutlined } from "@ant-design/icons";

interface Employee {
    id: string;
    fullName: string;
    position: string;
    unit: string;
    division?: string;
    contractPosition?: string;
}

interface Division {
    id: string;
    name: string;
    contract_positions?: string[];
}

interface ContractPosition {
    id: string;
    name: string;
    division: string;
    exception_employee?: string;
}

interface Props {
    pb: PocketBase;
}

const normalize = (value?: string) =>
    (value || "")
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/\s+/g, " ")
        .trim();

export const LinkEmployeeRelations: React.FC<Props> = ({ pb }) => {
    const [loading, setLoading] = useState(false);

    const runLinking = async () => {
        setLoading(true);

        let divisionLinked = 0;
        let contractLinked = 0;
        let updated = 0;
        let skipped = 0;
        const errors: string[] = [];

        try {
            // Загружаем подразделения
            const divisions = await pb.collection("divisions").getFullList<Division>({
                fields: "id,name,contract_positions",
                sort: "name",
            });

            // Загружаем должности по трудовым договорам
            const contractPositions =
                await pb.collection("contract_positions").getFullList<ContractPosition>({
                    fields: "id,name,division,exception_employee",
                });

            // Загружаем сотрудников
            const employees = await pb.collection("employees").getFullList<Employee>({
                fields:
                    "id,fullName,position,unit,division,contractPosition",
                sort: "fullName",
            });

            const divisionByName = new Map<string, Division>();

            divisions.forEach((division) => {
                divisionByName.set(normalize(division.name), division);
            });

            const divisionById = new Map<string, Division>();

            divisions.forEach((division) => {
                divisionById.set(division.id, division);
            });

            const contractById = new Map<string, ContractPosition>();

            contractPositions.forEach((position) => {
                contractById.set(position.id, position);
            });

            for (const employee of employees) {
                try {
                    // 1. Ищем подразделение по полю unit
                    const matchedDivision =
                        divisionByName.get(normalize(employee.unit));

                    // Если связь уже есть, не перезаписываем её
                    const divisionId =
                        employee.division ||
                        matchedDivision?.id ||
                        "";

                    let newDivision = employee.division || "";
                    let newContractPosition = employee.contractPosition || "";

                    if (!employee.division && matchedDivision) {
                        newDivision = matchedDivision.id;
                    }

                    // 2. Ищем должность только в найденном подразделении
                    const currentDivision = divisionById.get(divisionId);

                    if (!employee.contractPosition && currentDivision) {
                        const allowedIds = new Set(
                            currentDivision.contract_positions || []
                        );

                        const candidates = contractPositions.filter((position) => {
                            if (!allowedIds.has(position.id)) return false;

                            if (
                                normalize(position.name) !==
                                normalize(employee.position)
                            ) {
                                return false;
                            }

                            // Проверяем персональное исключение, если оно задано
                            if (position.exception_employee?.trim()) {
                                return (
                                    normalize(position.exception_employee) ===
                                    normalize(employee.fullName)
                                );
                            }

                            return true;
                        });

                        // Записываем только однозначное совпадение
                        if (candidates.length === 1) {
                            newContractPosition = candidates[0].id;
                        } else if (candidates.length > 1) {
                            errors.push(
                                `${employee.fullName}: найдено несколько должностей "${employee.position}"`
                            );
                        }
                    }

                    const updateData: Record<string, string> = {};

                    if (!employee.division && newDivision) {
                        updateData.division = newDivision;
                    }

                    if (!employee.contractPosition && newContractPosition) {
                        updateData.contractPosition = newContractPosition;
                    }

                    if (Object.keys(updateData).length === 0) {
                        if (!newDivision || !newContractPosition) {
                            skipped++;
                            errors.push(
                                `${employee.fullName} — подразделение: "${employee.unit}", должность: "${employee.position}"`
                            );
                        }
                        continue;
                    }

                    // Сохраняем связи в PocketBase
                    await pb.collection("employees").update(employee.id, updateData);

                    updated++;

                    if (updateData.division) divisionLinked++;
                    if (updateData.contractPosition) contractLinked++;
                } catch (error: any) {
                    skipped++;
                    errors.push(
                        `${employee.fullName}: ${error?.message || "Ошибка обновления"}`
                    );
                }
            }

            const report = [
                `Всего сотрудников: ${employees.length}`,
                `Подразделений найдено и записано: ${divisionLinked}`,
                `Должностей по ТД найдено и записано: ${contractLinked}`,
                `Сотрудников обновлено: ${updated}`,
                `Пропущено: ${skipped}`,
                `Проблем и несовпадений: ${errors.length}`,
            ];

            if (errors.length > 0) {
                console.warn("Ошибки привязки сотрудников:", errors);
            }

            Modal.info({
                title: "Результат привязки сотрудников",
                width: 650,
                content: (
                    <div>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {report.join("\n")}
            </pre>

                        {errors.length > 0 && (
                            <>
                                <p>
                                    <b>Сотрудники, требующие проверки:</b>
                                </p>
                                <div
                                    style={{
                                        maxHeight: 300,
                                        overflowY: "auto",
                                        fontSize: 12,
                                    }}
                                >
                                    {errors.map((error, index) => (
                                        <div key={index} style={{ marginBottom: 6 }}>
                                            {index + 1}. {error}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ),
            });
        } catch (error: any) {
            message.error(
                `Ошибка загрузки данных: ${error?.message || "Неизвестная ошибка"}`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClick = () => {
        Modal.confirm({
            title: "Связать сотрудников с подразделениями и должностями?",
            content:
                "Будут заполнены пустые поля division и contractPosition. Уже существующие связи останутся без изменений.",
            okText: "Да, выполнить",
            cancelText: "Отмена",
            onOk: runLinking,
        });
    };

    return (
        <Button
            type="primary"
            icon={<LinkOutlined />}
            loading={loading}
            onClick={handleClick}
        >
            Связать сотрудников
        </Button>
    );
};

