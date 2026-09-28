import {Menu, type MenuProps} from "antd";
import React, {useState} from "react";
import Sider from "antd/es/layout/Sider";
import {DesktopOutlined, FileOutlined, TeamOutlined, UserOutlined} from "@ant-design/icons";

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}

const items: MenuItem[] = [
    getItem('Сотрудники', '1', <UserOutlined />),
    getItem('Option 2', '2', <DesktopOutlined />),
    getItem('User', 'sub1', <UserOutlined />, [
        getItem('Tom', '3'),
        getItem('Bill', '4'),
        getItem('Alex', '5'),
    ]),
    getItem('Team', 'sub2', <TeamOutlined />, [getItem('Team 1', '6'), getItem('Team 2', '8')]),
    getItem('Files', '9', <FileOutlined />),
];

export const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className="flex flex-col leading-tight overflow-hidden items-center">
                    <span className={'text-white text-base font-semibold tracking-wide whitespace-nowrap'}>
                        УЧЕТ СИЗ
                    </span>
                </div>
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
            </Sider>

    )
}