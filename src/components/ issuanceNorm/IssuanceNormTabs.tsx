import {Tabs, type TabsProps} from "antd";
import {IssuanceNormRecordTable} from "./IssuanceNormRecordTable.tsx";
import type {IssuanceNormExpanded} from "../../types/norms.ts";

const onChange = (key: string) => {
    console.log(key);
};

type IssuanceNormTabsProps = {
    issuanceNorm: IssuanceNormExpanded | undefined;
};


export const IssuanceNormTabs = ({issuanceNorm}: IssuanceNormTabsProps) => {

    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Выдаваемые номенклатуры',
            children: <IssuanceNormRecordTable issuanceNorm={issuanceNorm}/>,
        },
        {
            key: '2',
            label: 'Tab 2',
            children: 'Content of Tab Pane 2',
        },
        {
            key: '3',
            label: 'Tab 3',
            children: 'Content of Tab Pane 3',
        },
    ];

    return (
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    )
}