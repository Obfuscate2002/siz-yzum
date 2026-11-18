import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from "@react-pdf/renderer";
import type {PpeIssuanceStatement} from "../../types/PpeIssuanceStatement.ts";
import type { PpeIssuanceStatementItem } from "../../types/PpeIssuanceStatementItem.ts";
import type {Employee} from "../../types/employee.ts";
import type {Division} from "../../types/divisions.ts";



type Props = {
    statement: PpeIssuanceStatement;
    items: PpeIssuanceStatementItem[];
    employees: Employee[];
    divisions: Division[];
};

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 9,
        fontFamily: "Helvetica",
    },
    title: {
        fontSize: 15,
        textAlign: "center",
        marginBottom: 18,
        fontWeight: "bold",
    },
    info: {
        marginBottom: 5,
        fontSize: 10,
    },
    section: {
        marginTop: 15,
        marginBottom: 8,
        fontSize: 11,
        fontWeight: "bold",
    },
    table: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#000",
        marginTop: 10,
    },
    row: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#000",
        minHeight: 28,
        alignItems: "stretch",
    },
    header: {
        backgroundColor: "#eeeeee",
        fontWeight: "bold",
    },
    cell: {
        padding: 5,
        borderRightWidth: 1,
        borderColor: "#000",
        justifyContent: "center",
    },
    number: { width: "5%" },
    nomenclature: { width: "35%" },
    quantity: { width: "10%" },
    unit: { width: "10%" },
    period: { width: "15%" },
    comment: { width: "25%", borderRightWidth: 0 },
    signatures: {
        marginTop: 35,
        lineHeight: 2,
        fontSize: 10,
    },
});

const getPeriod = (item: PpeIssuanceStatementItem) => {
    if (!item.wearPeriod) return "-";

    const units: Record<string, string> = {
        day: "дн.",
        month: "мес.",
        year: "г.",
    };

    return `${item.wearPeriod} ${units[item.wearPeriodUnit ?? ""] ?? ""}`;
};

export const PpeIssuanceStatementPdf = ({
                                            statement,
                                            items,
                                            employees,
                                            divisions,
                                        }: Props) => {
    const division = divisions.find(
        item => item.id === statement.division
    );

    const responsible = employees.find(
        item => item.id === statement.responsibleEmployee
    );

    const date = statement.statementDate
        ? new Date(statement.statementDate).toLocaleDateString("ru-RU")
        : "-";

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <Text style={styles.title}>
                    ВЕДОМОСТЬ ВЫДАЧИ СРЕДСТВ ИНДИВИДУАЛЬНОЙ ЗАЩИТЫ
                </Text>

                <Text style={styles.info}>
                    Номер ведомости: {statement.statementNumber}
                </Text>
                <Text style={styles.info}>Дата: {date}</Text>
                <Text style={styles.info}>
                    Подразделение: {division?.name ?? "-"}
                </Text>
                <Text style={styles.info}>
                    Ответственный: {responsible?.fullName ?? "-"}
                </Text>
                <Text style={styles.info}>
                    Основание: {statement.basis || "-"}
                </Text>

                <Text style={styles.section}>Перечень выданных СИЗ</Text>

                <View style={styles.table}>
                    <View style={[styles.row, styles.header]}>
                        <Text style={[styles.cell, styles.number]}>№</Text>
                        <Text style={[styles.cell, styles.nomenclature]}>
                            СИЗ
                        </Text>
                        <Text style={[styles.cell, styles.quantity]}>
                            Количество
                        </Text>
                        <Text style={[styles.cell, styles.unit]}>
                            Ед. изм.
                        </Text>
                        <Text style={[styles.cell, styles.period]}>
                            Срок носки
                        </Text>
                        <Text style={[styles.cell, styles.comment]}>
                            Комментарий
                        </Text>
                    </View>

                    {items.map((item, index) => {
                        const employee = employees.find(
                            person => person.id === item.employee
                        );

                        return (
                            <View
                                key={item.id}
                                style={styles.row}
                                wrap={false}
                            >
                                <Text style={[styles.cell, styles.number]}>
                                    {index + 1}
                                </Text>
                                <Text style={[styles.cell, styles.nomenclature]}>
                                    {item.expand?.warehouse_nomenclature?.name ?? "-"}
                                </Text>
                                <Text style={[styles.cell, styles.quantity]}>
                                    {item.quantity}
                                </Text>
                                <Text style={[styles.cell, styles.unit]}>
                                    {item.unit || "-"}
                                </Text>
                                <Text style={[styles.cell, styles.period]}>
                                    {getPeriod(item)}
                                </Text>
                                <Text style={[styles.cell, styles.comment]}>
                                    {[
                                        employee?.fullName,
                                        item.comment,
                                    ].filter(Boolean).join("\n") || "-"}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.signatures}>
                    <Text>
                        Ответственный: ____________________________
                    </Text>
                    <Text>
                        Подпись: __________________ Дата: ______________
                    </Text>
                    <Text>
                        СИЗ получил: ________________________________
                    </Text>
                    <Text>
                        Подпись: __________________ Дата: ______________
                    </Text>
                </View>
            </Page>
        </Document>
    );
};
