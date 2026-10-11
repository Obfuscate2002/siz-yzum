import { Breadcrumb, Layout, theme } from 'antd';
import {Sidebar} from "./Sidebar.tsx";
import {HeaderLayout} from "./Header.tsx";
import {Outlet, useLocation} from "react-router";
const {Content, Footer} = Layout;

type PagePath = '/employees' | '/ppe' | '/norms' | '/dashboard';

const AppLayout: React.FC = () => {

    const location = useLocation();
    const currentPath = location.pathname;

    const pageTitles: Record<PagePath, string> = {
        '/dashboard': 'Дашборд',
        '/employees': 'Сотрудники',
        '/ppe': 'СИЗ',
        '/norms': 'Нормы',

    };

    const currentTitle: string =
        currentPath in pageTitles
            ? pageTitles[currentPath as PagePath]
            : 'Страница не найдена';

    const items = [
        {
            title: 'Главная',
            href: '/',
        },
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
            <Layout>
                <HeaderLayout/>
                <Content style={{ margin: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={items} />
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
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