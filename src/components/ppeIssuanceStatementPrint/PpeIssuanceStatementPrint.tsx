import type { PpeIssuanceStatement } from "../../types/PpeIssuanceStatement";
import type { PpeIssuanceStatementItem } from "../../types/PpeIssuanceStatementItem";

import "./index.css";
import type {Division} from "../../types/divisions.ts";
import type {Employee} from "../../types/employee.ts";

interface Props {
    statement: PpeIssuanceStatement;
    items: PpeIssuanceStatementItem[];
    employees: Employee[];
    divisions: Division[];
}

export const PpeIssuanceStatementPrint = ({
                                              statement,
                                              items,
                                              employees,
                                              divisions,
                                          }: Props) => {
    const employee = employees.find((item) => item.id === statement.employee);
    const division = divisions.find((item) => item.id === statement.division);

    const responsible = employees.find(
        (item) => item.id === statement.responsibleEmployee
    );

    const formatDate = (date?: string) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("ru-RU");
    };

    const getWearPeriod = (item: PpeIssuanceStatementItem) => {
        if (!item.wearPeriod) return "";

        const units: Record<string, string> = {
            day: "дн.",
            month: "мес.",
            year: "г.",
        };

        return `${item.wearPeriod} ${units[item.wearPeriodUnit || ""] || ""}`;
    };

    const positionName =
        employee?.expand?.contractPosition?.name ||
        employee?.expand?.positionRelation?.name ||
        "";

    return (
        <div className="print-document">
            <div className="print-header">
                <div className="print-title">
                    ВЕДОМОСТЬ №{statement.statementNumber}
                </div>
                <div className="print-subtitle">
                    выдачи средств индивидуальной защиты
                </div>
            </div>

            <div className="print-organization">
                <div className="print-info-row">
                    <span>Организация:</span>
                    <strong>
                        АО "ЯРЗУМ", ИНН 7604174098, КПП 760401001,
                        150044, Ярославская обл., г. Ярославль
                    </strong>
                </div>

                <div className="print-info-row">
                    <span>Структурное подразделение:</span>
                    <strong>{division?.name || ""}</strong>
                </div>

                <div className="print-info-row">
                    <span>Дата составления:</span>
                    <strong>{formatDate(statement.statementDate)}</strong>
                </div>
            </div>

            <table className="print-table">
                <thead>
                <tr>
                    <th rowSpan={2} className="col-number">
                        Номер по порядку
                    </th>
                    <th rowSpan={2} className="col-employee">
                        Фамилия, имя, отчество
                    </th>
                    <th rowSpan={2} className="col-position">
                        Должность
                    </th>
                    <th rowSpan={2} className="col-personnel">
                        Табельный номер
                    </th>
                    <th colSpan={3}>
                        СИЗ
                    </th>
                    <th rowSpan={2} className="col-period">
                        Срок службы (мес.)
                    </th>
                    <th rowSpan={2} className="col-signature">
                        Подпись в получении
                    </th>
                </tr>
                <tr>
                    <th className="col-name">Наименование</th>
                    <th className="col-model">
                        Модель, марка, артикул, класс защиты СИЗ
                    </th>
                    <th className="col-quantity">
                        Количество (шт., пар)
                    </th>
                </tr>
                </thead>

                <tbody>
                {items.length > 0 ? (
                    items.map((item, index) => (
                        <tr key={item.id}>
                            {index === 0 && (
                                <>
                                    <td rowSpan={items.length} className="center">
                                        1
                                    </td>
                                    <td rowSpan={items.length} className="center">
                                        {employee?.fullName || ""}
                                    </td>
                                    <td rowSpan={items.length} className="center">
                                        {positionName}
                                    </td>
                                    <td rowSpan={items.length} className="center">
                                        {employee?.personnelNumber || ""}
                                    </td>
                                </>
                            )}

                            <td>{item.nomenclature || ""}</td>

                            <td>
                                {item.expand?.warehouse_nomenclature?.name || ""}
                            </td>

                            <td className="center">
                                {item.quantity} {item.unit}
                            </td>

                            <td className="center">
                                {getWearPeriod(item)}
                            </td>

                            <td />
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={9} className="center">
                            Нет позиций для выдачи
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            <div className="print-responsible">
                <strong>Ответственное лицо за выдачу СИЗ:</strong>
                <span>
                    {responsible?.fullName || ""}
                </span>
                <span className="signature-line" />
            </div>

            <div className="print-footer">
                <span>Подпись ответственного лица: ____________________</span>
                <span>Дата: ____________________</span>
            </div>
        </div>
    );
};