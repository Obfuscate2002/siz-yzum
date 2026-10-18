import {Tabs, type TabsProps} from "antd";
import {IssuanceNormRecordTable} from "./IssuanceNormRecordTable.tsx";
import type {IssuanceNormHeaderExpanded} from "../../types/norms.ts";


const onChange = (key: string) => {
    console.log(key);
};

type IssuanceNormTabsProps = {
    issuanceNorm: IssuanceNormHeaderExpanded | undefined;
};


export const IssuanceNormTabs = ({issuanceNorm}: IssuanceNormTabsProps) => {

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Выдаваемые номенклатуры',
            children: <IssuanceNormRecordTable issuanceNorm={issuanceNorm}/>,
        },
    ];

    return (
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    )
}