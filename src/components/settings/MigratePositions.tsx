import { useState } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

interface Position {
    id: string;
    name: string;
}

interface IssuanceStandard {
    id: string;
    position_name: string;
    position: string;
}

interface MigrationMatch {
    id: string;
    position: string;
}

interface UnmatchedPosition {
    id: string;
    position_name: string;
}

interface Preview {
    matched: MigrationMatch[];
    unmatched: UnmatchedPosition[];
    alreadyLinked: string[];
}

export function MigratePositions() {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<Preview | null>(null);
    const [message, setMessage] = useState("");

    const findMatches = async (): Promise<void> => {
        setLoading(true);
        setMessage("");
        setPreview(null);

        try {
            const [positions, standards] = await Promise.all([
                pb.collection("positions").getFullList<Position>({
                    fields: "id,name",
                }),
                pb
                    .collection("ppe_issuance_standards")
                    .getFullList<IssuanceStandard>({
                        fields: "id,position_name,position",
                    }),
            ]);

            const positionsByName = new Map<string, string>();

            for (const position of positions) {
                const key = position.name.trim().toLocaleLowerCase("ru");
                positionsByName.set(key, position.id);
            }

            const matched: MigrationMatch[] = [];
            const unmatched: UnmatchedPosition[] = [];
            const alreadyLinked: string[] = [];

            for (const standard of standards) {
                if (standard.position) {
                    alreadyLinked.push(standard.id);
                    continue;
                }

                const key = standard.position_name
                    ?.trim()
                    .toLocaleLowerCase("ru");

                const positionId = key
                    ? positionsByName.get(key)
                    : undefined;

                if (positionId) {
                    matched.push({
                        id: standard.id,
                        position: positionId,
                    });
                } else {
                    unmatched.push({
                        id: standard.id,
                        position_name: standard.position_name ?? "",
                    });
                }
            }

            setPreview({ matched, unmatched, alreadyLinked });
            setMessage("Проверка завершена.");
        } catch (error: unknown) {
            console.error(error);
            setMessage(getErrorMessage(error, "Ошибка проверки."));
        } finally {
            setLoading(false);
        }
    };

    const applyMigration = async (): Promise<void> => {
        if (!preview || preview.matched.length === 0) {
            return;
        }

        const confirmed = window.confirm(
            `Заполнить связи для ${preview.matched.length} записей?`
        );

        if (!confirmed) {
            return;
        }

        setLoading(true);
        setMessage("");

        let updated = 0;
        const errors: Array<{ id: string; message: string }> = [];

        try {
            for (const item of preview.matched) {
                try {
                    await pb
                        .collection("ppe_issuance_standards")
                        .update(item.id, {
                            position: item.position,
                        });

                    updated++;
                } catch (error: unknown) {
                    errors.push({
                        id: item.id,
                        message: getErrorMessage(error, "Ошибка обновления."),
                    });
                }
            }

            setMessage(
                `Обновлено: ${updated}. Ошибок: ${errors.length}.`
            );

            if (errors.length > 0) {
                console.error("Ошибки обновления:", errors);
            }

            await findMatches();
        } catch (error: unknown) {
            console.error(error);
            setMessage("Ошибка миграции.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="space-y-4 rounded-lg border p-4">
            <h2 className="text-lg font-semibold">
                Связи должностей и норм СИЗ
            </h2>

            <button
                type="button"
                onClick={findMatches}
                disabled={loading}
                className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
                {loading ? "Обработка..." : "Проверить совпадения"}
            </button>

            {preview && (
                <div className="space-y-2">
                    <p>Найдено совпадений: {preview.matched.length}</p>
                    <p>Без совпадений: {preview.unmatched.length}</p>
                    <p>Уже связаны: {preview.alreadyLinked.length}</p>

                    {preview.unmatched.length > 0 && (
                        <details>
                            <summary>Показать несовпавшие должности</summary>

                            <ul className="list-inside list-disc">
                                {preview.unmatched.map((item) => (
                                    <li key={item.id}>
                                        {item.position_name || "(пустое название)"}
                                    </li>
                                ))}
                            </ul>
                        </details>
                    )}

                    <button
                        type="button"
                        onClick={applyMigration}
                        disabled={loading || preview.matched.length === 0}
                        className="rounded bg-green-700 px-4 py-2 text-white disabled:opacity-50"
                    >
                        Заполнить связи
                    </button>
                </div>
            )}

            {message && <p role="status">{message}</p>}
        </section>
    );
}

function getErrorMessage(
    error: unknown,
    fallback: string
): string {
    if (error instanceof Error) {
        return error.message;
    }

    return fallback;
}