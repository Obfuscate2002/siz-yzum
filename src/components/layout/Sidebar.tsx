import {Menu, type MenuProps} from "antd";
import React from "react";
import Sider from "antd/es/layout/Sider";
import {
    BankOutlined, CheckSquareOutlined,
    HomeOutlined, SafetyOutlined, SettingOutlined, UsergroupAddOutlined,
    UserOutlined
} from "@ant-design/icons";
import {useLocation, useNavigate} from "react-router";

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
    getItem('Главная', 'dashboard', <HomeOutlined />),
    getItem('Сотрудники', 'employees', <UsergroupAddOutlined />),
    getItem('СИЗ', 'ppe', <SafetyOutlined />),
    getItem('Нормы', 'norms', <CheckSquareOutlined />),
    getItem('Настройки', 'settings', <SettingOutlined />),
];

export const Sidebar = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation: MenuProps['onClick'] = (event) => {
        navigate(event.key);
    }

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
                        <Menu
                            className={'bg-gray-50'}
                            selectedKeys={[location.pathname.replace('/', '')]}
                            mode="inline"
                            items={items}
                            onClick={handleNavigation}
                        />
                    </div>
                    <div className={'flex flex-row justify-center items-center'}>
                        <UserOutlined  className={'text-3xl'}/>
                        <div className={'flex flex-col m-3 justify-center items-center'}>
                            <div className={'flex gap-2'}>

                                <span>
                            vasya@yrzum76.su
                        </span>
                            </div>
                            <span className={'text-black/40'}>
                            Пользователь
                        </span>
                        </div>
                    </div>
                </div>

            </Sider>
        </div>


    )
}