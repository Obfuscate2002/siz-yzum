import {ImportPositions} from "../components/settings/ImportPositions.tsx";
import {Typography} from "antd";
import {MigrateEmployeePositions} from "../components/settings/MigrateEmployeePositions.tsx";
import {MigratePositions} from "../components/settings/MigratePositions.tsx";

export const PageSettings = () => {

    return (
        <div className={'flex flex-col gap-5'}>
            <Typography.Title level={2} className={'text-red-500'}>ИСПОЛЬЗОВАНИЕ ФУНКЦИОНАЛА ДАННОГО РАЗДЕЛА ЗАПРЕЩЕНО ПОЛЬЗОВАТЕЛЯМ!!!</Typography.Title>
            <Typography.Text strong className={'text-xl'}>Если вы видите эту страницу, значит права доступа не настроены</Typography.Text>
            <div className={'grid grid-cols-3'}>
                <div>
                    <label>Кнопка импорта должностей из eployees.position в position.name</label>
                    <br/>
                    <ImportPositions/>
                </div>
                <div>
                    <label>Кнопка миграции eployees.position (текст) в employees.positionRelation (поле содержит ссылку на positions.name)</label>
                    <br/>
                    <MigrateEmployeePositions/>
                </div>
                <div>
                    <label>Кнопка миграции</label>
                    <br/>
                    <MigratePositions/>
                </div>


            </div>
        </div>
    )
}