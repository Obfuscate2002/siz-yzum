import {Typography} from "antd";
import {ClearPpeStandardsButton} from "../components/positions/ClearPpeIssuanceStandard.tsx";
import {pb} from "../pocketbase/pocketbase.ts";
import {RemovePpeDuplicatesButton} from "../components/positions/RemovePpeDuplicatesButton.tsx";
import {ExportPpeStandardsButton} from "../components/positions/ExportPpeStandardsButton.tsx";

export const PageSettings = () => {

    return (
        <div className={'flex flex-col gap-5'}>
            <Typography.Title level={2} className={'text-red-500'}>ИСПОЛЬЗОВАНИЕ ФУНКЦИОНАЛА ДАННОГО РАЗДЕЛА ЗАПРЕЩЕНО ПОЛЬЗОВАТЕЛЯМ!!!</Typography.Title>
            <Typography.Text strong className={'text-xl'}>Если вы видите эту страницу, значит права доступа не настроены</Typography.Text>
            <div className={'grid grid-cols-3'}>
                <div>
                    <label>Кнопка импорта должностей из eployees.position в position.name</label>
                    <br/>
                    {/*<ImportPositions/>*/}
                </div>
                <div>
                    <label>Кнопка миграции eployees.position (текст) в employees.positionRelation (поле содержит ссылку на positions.name)</label>
                    <br/>
                    {/*<MigrateEmployeePositions/>*/}
                </div>
                <div>
                    <label>Кнопка миграции</label>
                    <br/>
                    {/*<MigratePositions/>*/}
                </div>
                <div>
                    {/*<MatchPositions/>*/}
                </div>
                <div className={'border border-gray-400 rounded-md'}>
                    <Typography.Title className={'m-3'} level={3}>Обработки: справочник норм СИЗ</Typography.Title>
                    <div className={'flex flex-row gap-3 m-3'}>
                        <ClearPpeStandardsButton pb={pb}/>
                        <RemovePpeDuplicatesButton pb={pb}/>
                        <ExportPpeStandardsButton pb={pb}/>
                    </div>
                </div>
            </div>
        </div>
    )
}