import { Breadcrumb, Layout, theme } from 'antd';
import {Sidebar} from "./Sidebar.tsx";
import {HeaderLayout} from "./Header.tsx";
import {Outlet, useLocation} from "react-router";
const {Content, Footer} = Layout;

type PagePath = '/employees' | '/ppe' | '/norms' | '/dashboard' | '/settings' | '/norms_catalog' | '/issuance_norms' | '/ppeIssuanceStandards' | '/divisions' | '/warehouse/nomenclature';

const AppLayout: React.FC = () => {

    const location = useLocation();
    const currentPath = location.pathname;

    const pageTitles: Record<PagePath, string> = {
        '/dashboard': 'Дашборд',
        '/employees': 'Сотрудники',
        '/ppe': 'СИЗ',
        '/norms': 'Нормы',
        '/norms_catalog': 'Справочник видов номенклатуры',
        '/issuance_norms': 'Нормы выдачи',
        '/ppeIssuanceStandards': 'Справочник норм СИЗ',
        '/settings': 'Настройки',
        '/divisions': 'Справочник подразделений',
        '/warehouse/nomenclature': 'Справочник номенклатуры'

    };

    const currentTitle: string =
        currentPath in pageTitles
            ? pageTitles[currentPath as PagePath]
            : 'Страница не найдена';

    const items = [
        {
            title: 'Главная',
            href: '/dashboard',
        },
        ...(currentPath.startsWith('/warehouse')
            ? [
                {
                    title: 'Склад',
                },
            ]
            : []),
        {
            title: currentTitle,
        },
    ];



    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const currentYear = new Date().getFullYear();

    return (
        <Layout style={{ minHeight: '100vh' }}>
        <Sidebar/>
            <Layout style={{
                marginLeft: 280,
                minHeight: '100vh',
                background: '#f5f5f5',
            }}>
                <HeaderLayout/>
                <Content style={{
                    margin: '0 16px',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={items} />
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            flex: 1,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >

                        <Outlet/>
                    </div>

                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    СИЗ ЯРЗУМ ©{currentYear} Created by Anton
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AppLayout;