
import { useQuery } from "@tanstack/react-query";
import { Divider, Spin, Table, Typography} from "antd";
import type { ColumnsType } from "antd/es/table";
import { pb } from "../../pocketbase/pocketbase.ts";

interface IssuanceHistoryItem {
    id: string;
    employee: string;
    statement: string;
    nomenclature: string;
    warehouse_nomenclature: string;
    quantity: number;
    unit: string;
    created: string;
    expand?: {
        statement?: {
            id: string;
            statementNumber: string;
            statementDate: string;
        };
        warehouse_nomenclature?: {
            id: string;
            name: string;
        };
    };
}

interface Props {
    employeeId?: string;
}

const formatDate = (date?: string) => {
    if (!date) return "";

    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(date));
};

export const EmployeeIssuanceHistory = ({ employeeId }: Props) => {
    const {
        data: items = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["employee-issuance-history", employeeId],
        enabled: Boolean(employeeId),
        queryFn: async (): Promise<IssuanceHistoryItem[]> => {
            if (!employeeId) return [];

            const records = await pb
                .collection("ppe_issuance_statement_items")
                .getFullList<IssuanceHistoryItem>({
                    filter: `employee = "${employeeId}"`,
                    expand: "statement,warehouse_nomenclature",
                    requestKey: null,
                });

            // Сначала старые выдачи, затем новые.
            return records.sort((a, b) => {
                const dateA = a.expand?.statement?.statementDate || "";
                const dateB = b.expand?.statement?.statementDate || "";

                const dateCompare = dateA.localeCompare(dateB);

                if (dateCompare !== 0) return dateCompare;

                return a.created.localeCompare(b.created);
            });
        },
    });

    const columns: ColumnsType<IssuanceHistoryItem> = [
        {
            title: "№",
            key: "index",
            width: 55,
            align: "center",
            render: (_value, _record, index) => index + 1,
        },
        {
            title: "Наименование СИЗ",
            dataIndex: "nomenclature",
            key: "nomenclature",
            width: 190,
            render: (value: string) => value || "Не указано",
        },
        {
            title: "Модель, марка, артикул",
            key: "model",
            width: 190,
            render: (_value, record) =>
                record.expand?.warehouse_nomenclature?.name || "Не указано",
        },
        {
            title: "Выдано: дата",
            key: "date",
            width: 110,
            align: "center",
            render: (_value, record) =>
                formatDate(record.expand?.statement?.statementDate),
        },
        {
            title: "Выдано: количество",
            key: "quantity",
            width: 130,
            align: "center",
            render: (_value, record) =>
                `${record.quantity ?? 0} ${record.unit ?? ""}`.trim(),
        },
        {
            title: "Лично дозатор",
            key: "personal",
            width: 120,
            render: () => "",
        },
        {
            title: "Подпись получившего СИЗ",
            key: "signature",
            width: 180,
            align: "center",
            render: (_value, record) =>
                record.expand?.statement?.statementNumber
                    ? `№ ${record.expand.statement.statementNumber}`
                    : "",
        },
    ];

    if (!employeeId) return null;

    return (
        <>
            <Divider />

            <Typography.Title level={3}>
                История выдачи СИЗ:
            </Typography.Title>

            {isLoading ? (
                <div className="flex justify-center p-6">
                    <Spin tip="Загрузка истории выдачи..." />
                </div>
            ) : isError ? (
                <div className="text-red-500 p-3">
                    Не удалось загрузить историю выдачи СИЗ.
                </div>
            ) : (
                <Table<IssuanceHistoryItem>
                    rowKey="id"
                    columns={columns}
                    dataSource={items}
                    size="middle"
                    bordered
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50", "100"],
                        showTotal: (total) => `Всего записей: ${total}`,
                    }}
                    scroll={{ x: 975 }}
                    locale={{
                        emptyText: "У сотрудника пока нет выдач СИЗ",
                    }}
                />
            )}
        </>
    );
};
