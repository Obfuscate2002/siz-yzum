import {Dropdown, type MenuProps, Space} from "antd";
import { MenuOutlined } from "@ant-design/icons";

const items: MenuProps['items'] = [
    {
        key: '1',
        label: 'Редактировать',
    },
    {
        key: '2',
        danger: true,
        label: 'Удалить',
    },
];

export const ActionsCell = () => {
    return (
        <Dropdown menu={{ items }}>
            <a onClick={(e) => e.preventDefault()}>
                <Space>
                    <MenuOutlined />
                </Space>
            </a>
        </Dropdown>
    )
}