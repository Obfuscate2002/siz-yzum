
import { useState } from "react";
import {pb} from "../../pocketbase/pocketbase.ts";


type Status =
    | "matched"
    | "already"
    | "missing"
    | "duplicate"
    | "empty"
    | "failed";

interface PositionRecord {
    id: string;
    name: string;
}

interface SourceConfig {
    collection: string;
    textField: string;
    relationField: string;
    label: string;
}

interface MatchRow {
    key: string;
    collection: string;
    label: string;
    recordId: string;
    oldName: string;
    relationField: string;
    positionId: string | null;
    positionName: string;
    status: Status;
    error?: string;
}

const SOURCES: SourceConfig[] = [
    {
        collection: "ppe_issuance_standards",
        textField: "position_name",
        relationField: "position",
        label: "Нормы СИЗ",
    },
    {
        collection: "employees",
        textField: "position",
        relationField: "positionRelation",
        label: "Сотрудники",
    },
];

const STATUS_LABELS: Record<Status, string> = {
    matched: "Совпадение",
    already: "Уже связано",
    missing: "Не найдено",
    duplicate: "Дубликат в справочнике",
    empty: "Пустая должность",
    failed: "Ошибка записи",
};

function normalize(value: string | null | undefined): string {
    return (value ?? "")
        .normalize("NFC")
        .trim()
        .replace(/\s+/g, " ")
        .toLocaleLowerCase("ru-RU");
}

export function MatchPositions() {
    const [rows, setRows] = useState<MatchRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    async function checkPositions(): Promise<MatchRow[]> {
        const [positions, ...collections] = await Promise.all([
            pb.collection("positions").getFullList<PositionRecord>({
                sort: "name",
            }),
            ...SOURCES.map((source) =>
                pb.collection(source.collection).getFullList()
            ),
        ]);

        const positionMap = new Map<string, PositionRecord[]>();

        for (const position of positions) {
            const key = normalize(position.name);
            if (!key) continue;

            const candidates = positionMap.get(key) ?? [];
            candidates.push(position);
            positionMap.set(key, candidates);
        }

        const result: MatchRow[] = [];

        SOURCES.forEach((source, index) => {
            for (const record of collections[index]) {
                const oldName = String(record[source.textField] ?? "");
                const key = normalize(oldName);
                const candidates = key ? positionMap.get(key) ?? [] : [];

                let status: Status;
                let positionId: string | null = null;
                let positionName = "";

                if (!key) {
                    status = "empty";
                } else if (candidates.length === 0) {
                    status = "missing";
                } else if (candidates.length > 1) {
                    status = "duplicate";
                } else {
                    const position = candidates[0];
                    positionId = position.id;
                    positionName = position.name;

                    status =
                        record[source.relationField] === position.id
                            ? "already"
                            : "matched";
                }

                result.push({
                    key: `${source.collection}:${record.id}`,
                    collection: source.collection,
                    label: source.label,
                    recordId: record.id,
                    oldName,
                    relationField: source.relationField,
                    positionId,
                    positionName,
                    status,
                });
            }
        });

        setRows(result);
        return result;
    }

    async function handleCheck() {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            await checkPositions();
            setMessage("Проверка завершена. Данные не изменялись.");
        } catch (e: unknown) {
            setError(
                e instanceof Error ? e.message : "Ошибка проверки должностей"
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleApply() {
        const matches = rows.filter(
            (row) => row.status === "matched" && row.positionId
        );

        if (matches.length === 0) {
            setMessage("Нет новых совпадений для записи.");
            return;
        }

        const confirmed = window.confirm(
            `Будет обновлено записей: ${matches.length}.\n` +
            "Старые текстовые поля останутся без изменений.\nПродолжить?"
        );

        if (!confirmed) return;

        setApplying(true);
        setError("");
        setMessage("");

        let success = 0;
        const failedRows: MatchRow[] = [];

        try {
            for (const row of matches) {
                try {
                    await pb.collection(row.collection).update(row.recordId, {
                        [row.relationField]: row.positionId,
                    });
                    success++;
                } catch (e: unknown) {
                    failedRows.push({
                        ...row,
                        status: "failed",
                        error:
                            e instanceof Error ? e.message : "Неизвестная ошибка",
                    });
                }
            }

            // Обновляем таблицу фактическим состоянием базы
            const updatedRows = await checkPositions();

            setRows([
                ...updatedRows,
                ...failedRows,
            ]);

            setMessage(
                `Успешно обновлено: ${success}. Ошибок записи: ${failedRows.length}.`
            );
        } catch (e: unknown) {
            setError(
                e instanceof Error ? e.message : "Ошибка обновления должностей"
            );
        } finally {
            setApplying(false);
        }
    }

    const counts = rows.reduce<Partial<Record<Status, number>>>(
        (acc, row) => {
            acc[row.status] = (acc[row.status] ?? 0) + 1;
            return acc;
        },
        {}
    );

    const canApply = rows.some((row) => row.status === "matched");

    return (
        <div style={{ padding: 24, maxWidth: 1100 }}>
            <h2>Сопоставление должностей</h2>

            <p>
                Связывание сотрудников и норм СИЗ с единым справочником
                должностей.
            </p>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    marginBottom: 16,
                }}
            >
                <button
                    type="button"
                    onClick={handleCheck}
                    disabled={loading || applying}
                >
                    {loading ? "Проверка..." : "1. Проверить должности"}
                </button>

                <button
                    type="button"
                    onClick={handleApply}
                    disabled={loading || applying || !canApply}
                >
                    {applying ? "Сохранение..." : "2. Записать связи"}
                </button>
            </div>

            {message && <p role="status">{message}</p>}

            {error && (
                <p role="alert" style={{ color: "crimson" }}>
                    {error}
                </p>
            )}

            {rows.length > 0 && (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <p>Всего записей: {rows.length}</p>
                        <p>Совпадений: {counts.matched ?? 0}</p>
                        <p>Уже связано: {counts.already ?? 0}</p>
                        <p>Не найдено: {counts.missing ?? 0}</p>
                        <p>Дубликатов: {counts.duplicate ?? 0}</p>
                        <p>Пустых должностей: {counts.empty ?? 0}</p>
                        <p>Ошибок: {counts.failed ?? 0}</p>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                            }}
                        >
                            <thead>
                            <tr>
                                <th style={cellStyle}>Коллекция</th>
                                <th style={cellStyle}>Старая должность</th>
                                <th style={cellStyle}>Найденная должность</th>
                                <th style={cellStyle}>Статус</th>
                            </tr>
                            </thead>

                            <tbody>
                            {rows.map((row) => (
                                <tr key={row.key}>
                                    <td style={cellStyle}>{row.label}</td>
                                    <td style={cellStyle}>{row.oldName || "—"}</td>
                                    <td style={cellStyle}>{row.positionName || "—"}</td>
                                    <td style={cellStyle}>
                                        {STATUS_LABELS[row.status]}
                                        {row.error ? `: ${row.error}` : ""}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

const cellStyle: React.CSSProperties = {
    textAlign: "left",
    padding: 8,
    borderBottom: "1px solid #ddd",
};
