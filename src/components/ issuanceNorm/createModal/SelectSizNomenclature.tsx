import React, {useEffect, useState} from 'react';
import {message, Select} from 'antd';
import {getSizNomenclature} from "../../../hooks/useSizNomenclature.tsx";
import type {SizNomenclature} from "../../../types/sizNomenclature.ts";

export const SelectSizNomenclature: React.FC = () => {

    const [options, setOptions] = useState<{value: string, label: string}[]>([])

    const [loading, setLoading] = useState<boolean>(false)


    useEffect(() => {
        const loadSizNomenclature =  async () => {
            setLoading(true)
            try {
                const data: SizNomenclature[] = await getSizNomenclature();
                setOptions(
                    data.map((item) => ({
                        value: item.id,
                        label: item.name,
                    })),
                );
            } catch (error) {
                console.error("Ошибка загрузки номенклатуры СИЗ:", error);
                message.error("Ошибка загрузки СИЗ");
            } finally {
                setLoading(false)
            }
        }

        void loadSizNomenclature();
    },[])

    return (
        <>
            {loading ? <div>Нет данных</div> : <Select
                className={'w-auto'}
                showSearch
                style={{ width: 450 }}
                placeholder="Выберите СИЗ"
                options={options}
            />}
        </>
        )
}
