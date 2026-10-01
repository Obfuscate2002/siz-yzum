import {Menu, type MenuProps} from "antd";
import React from "react";
import Sider from "antd/es/layout/Sider";
import {
    BankOutlined,
    DesktopOutlined,
    FileOutlined,
    TeamOutlined,
    UserOutlined
} from "@ant-design/icons";

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
    getItem('СИЗ', '2', <DesktopOutlined />),
    getItem('User', 'sub1', <UserOutlined />, [
        getItem('Tom', '3'),
        getItem('Bill', '4'),
        getItem('Alex', '5'),
    ]),
    getItem('Team', 'sub2', <TeamOutlined />, [getItem('Team 1', '6'), getItem('Team 2', '8')]),
    getItem('Files', '9', <FileOutlined />),
];

export const Sidebar = () => {

    return (
        <div className={'min-h-screen'}>
            <Sider className={'bg-gray-50 '}>
                <div className={'flex flex-col min-h-screen'}>
                    <div className={"flex flex-col leading-tight overflow-hidden items-center"}>
                    <span className={'text-blue-500 text-base font-semibold tracking-wide whitespace-nowrap m-3'}>
                        <BankOutlined /> SIZ-YZUM
                    </span>
                    </div>
                    <div className={'flex-1'}>
                        <Menu className={'bg-gray-50'} defaultSelectedKeys={['1']} mode="inline" items={items} />
                    </div>
                    <div className={'flex flex-col m-3 justify-center items-center'}>
                        <div className={'flex gap-2'}>
                            <UserOutlined  className={'text-2xl'}/>
                            <span>
                            vasya@yrzum76.su
                        </span>
                        </div>
                        <span className={'text-black/40'}>
                            Пользователь
                        </span>
                    </div>

                </div>

            </Sider>
        </div>


    )
}