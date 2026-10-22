
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import PocketBase from "pocketbase";
import * as XLSX from "xlsx";
import {
    Button,
    Progress,
    Space,
    Typography,
    message,
    Alert,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Text } = Typography;

type Props = {
    pb: PocketBase;
};

type ExcelRow = {
    ppe_type?: unknown;
    ppe_name?: unknown;
    issuance_norm?: unknown;
    issuance_basis?: unknown;
    position_name?: unknown;
    position?: unknown;
};

type Standard = {
    id: string;
    ppe_type: string;
    ppe_name: string;
    issuance_norm: string;
    issuance_basis: string;
    position_name: string;
    position: string;
};

type Counters = {
    total: number;
    created: number;
    duplicates: number;
    invalid: number;
    failed: number;
};

const clean = (value: unknown): string =>
    String(value ?? "")
        .replace(/\u00A0/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const normalize = (value: unknown): string =>
    clean(value).toLocaleLowerCase("ru-RU");

const getKey = (row: {
    ppe_type: string;
    ppe_name: string;
    issuance_norm: string;
    issuance_basis: string;
    position: string;
}) =>
    JSON.stringify([
        row.position,
        normalize(row.ppe_type),
        normalize(row.ppe_name),
        normalize(row.issuance_norm),
        normalize(row.issuance_basis),
    ]);

export default function ImportPpeStandardsButton({ pb }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("");
    const [report, setReport] = useState<Counters | null>(null);
    const [errors, setErrors] = useState<string[]>([]);

    const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        if (!/\.(xlsx|xls)$/i.test(file.name)) {
            message.error("Выберите файл Excel (.xlsx или .xls)");
            return;
        }

        setLoading(true);
        setProgress(0);
        setStatus("Проверка файла...");
        setReport(null);
        setErrors([]);

        const counters: Counters = {
            total: 0,
            created: 0,
            duplicates: 0,
            invalid: 0,
            failed: 0,
        };

        const problems: string[] = [];

        try {
            // 1. Читаем первый лист Excel.
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

            if (!firstSheet) {
                throw new Error("В Excel нет листов с данными");
            }

            const rows = XLSX.utils.sheet_to_json<ExcelRow>(firstSheet, {
                defval: "",
                raw: false,
            });

            counters.total = rows.length;

            if (!rows.length) {
                throw new Error("Файл не содержит записей");
            }

            // 2. Проверяем названия столбцов.
            const headers = Object.keys(rows[0]);
            const requiredColumns = [
                "ppe_type",
                "ppe_name",
                "issuance_norm",
                "issuance_basis",
                "position_name",
                "position",
            ];

            const missing = requiredColumns.filter(
                (column) => !headers.includes(column),
            );

            if (missing.length) {
                throw new Error(
                    `Не найдены столбцы: ${missing.join(", ")}`,
                );
            }

            setStatus("Загрузка существующих данных для сверки...");

            // 3. Получаем допустимые ID должностей.
            const positions = await pb.collection("positions").getFullList<{
                id: string;
                name: string;
            }>({
                fields: "id,name",
            });

            const positionIds = new Set(positions.map((p) => p.id));

            // 4. Загружаем текущие нормы из базы.
            const existing = await pb
                .collection("ppe_issuance_standards")
                .getFullList<Standard>({
                    fields:
                        "id,ppe_type,ppe_name,issuance_norm,issuance_basis,position_name,position",
                });

            // Сюда попадут ключи всех уже существующих норм.
            const knownKeys = new Set<string>();

            for (const item of existing) {
                const positionId = clean(item.position);

                if (!positionId) continue;

                knownKeys.add(
                    getKey({
                        position: positionId,
                        ppe_type: item.ppe_type,
                        ppe_name: item.ppe_name,
                        issuance_norm: item.issuance_norm,
                        issuance_basis: item.issuance_basis,
                    }),
                );
            }

            // 5. Проверяем файл и убираем повторы внутри самого Excel.
            const toImport: Array<{
                rowNumber: number;
                payload: Omit<Standard, "id">;
                key: string;
            }> = [];

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];

                const positionId = clean(row.position);
                const positionName = clean(row.position_name);
                const ppeType = clean(row.ppe_type);
                const ppeName = clean(row.ppe_name);
                const issuanceNorm = clean(row.issuance_norm);
                const issuanceBasis = clean(row.issuance_basis);

                // Без этих данных нельзя надёжно определить норму.
                if (
                    !positionId ||
                    !positionName ||
                    !ppeType ||
                    !ppeName ||
                    !issuanceNorm ||
                    !issuanceBasis
                ) {
                    counters.invalid++;
                    problems.push(
                        `Строка ${i + 2}: отсутствуют обязательные поля или ID должности`,
                    );
                    continue;
                }

                // Проверяем, что ID существует в коллекции positions.
                if (!positionIds.has(positionId)) {
                    counters.invalid++;
                    problems.push(
                        `Строка ${i + 2}: ID должности "${positionId}" не найден`,
                    );
                    continue;
                }

                const payload = {
                    ppe_type: ppeType,
                    ppe_name: ppeName,
                    issuance_norm: issuanceNorm,
                    issuance_basis: issuanceBasis,
                    position_name: positionName,
                    position: positionId,
                };

                const key = getKey(payload);

                // Set содержит как записи из базы, так и уже проверенные строки Excel.
                if (knownKeys.has(key)) {
                    counters.duplicates++;
                    continue;
                }

                knownKeys.add(key);
                toImport.push({
                    rowNumber: i + 2,
                    payload,
                    key,
                });
            }

            // 6. Создаём только проверенные уникальные записи.
            for (let i = 0; i < toImport.length; i++) {
                const item = toImport[i];

                setStatus(
                    `Импорт: ${i + 1} из ${toImport.length}`,
                );

                try {
                    await pb
                        .collection("ppe_issuance_standards")
                        .create(item.payload);

                    counters.created++;
                } catch (error) {
                    counters.failed++;

                    const detail =
                        error instanceof Error ? error.message : String(error);

                    problems.push(
                        `Строка ${item.rowNumber}: ${detail}`,
                    );

                    // Если запрос завершился ошибкой, снимаем ключ,
                    // чтобы он не блокировал повторную строку в этом файле.
                    knownKeys.delete(item.key);
                }

                setProgress(
                    Math.round(((i + 1) / Math.max(toImport.length, 1)) * 100),
                );
            }

            setReport({ ...counters });
            setErrors(problems);

            setStatus(
                `Завершено: добавлено ${counters.created}, ` +
                `дублей пропущено ${counters.duplicates}, ` +
                `ошибок данных ${counters.invalid}, ` +
                `ошибок записи ${counters.failed}`,
            );

            if (counters.failed === 0 && counters.invalid === 0) {
                message.success(
                    `Импорт завершён. Добавлено записей: ${counters.created}`,
                );
            } else {
                message.warning(
                    "Импорт завершён с замечаниями. Проверь отчёт ниже.",
                );
            }
        } catch (error) {
            const detail =
                error instanceof Error ? error.message : String(error);

            setStatus(`Ошибка: ${detail}`);
            message.error(detail);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Space direction="vertical" style={{ width: "100%" }}>
            <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                hidden
                onChange={handleFile}
            />

            <Button
                type="primary"
                icon={<UploadOutlined />}
                loading={loading}
                disabled={loading}
                onClick={() => inputRef.current?.click()}
            >
                Импортировать нормы из Excel
            </Button>

            {status && <Text>{status}</Text>}

            {(loading || progress > 0) && (
                <Progress percent={progress} />
            )}

            {report && (
                <Alert
                    type={report.failed || report.invalid ? "warning" : "success"}
                    showIcon
                    message="Результат импорта"
                    description={
                        <Space direction="vertical">
                            <Text>Всего строк: {report.total}</Text>
                            <Text>Создано: {report.created}</Text>
                            <Text>Дублей пропущено: {report.duplicates}</Text>
                            <Text>Некорректных строк: {report.invalid}</Text>
                            <Text>Ошибок записи в PocketBase: {report.failed}</Text>
                        </Space>
                    }
                />
            )}

            {errors.length > 0 && (
                <Alert
                    type="warning"
                    showIcon
                    message={`Замечания (${errors.length})`}
                    description={
                        <div style={{ maxHeight: 300, overflow: "auto" }}>
                            {errors.map((error, index) => (
                                <div key={`${index}-${error}`}>{error}</div>
                            ))}
                        </div>
                    }
                />
            )}
        </Space>
    );
}
