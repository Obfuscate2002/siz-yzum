import { Breadcrumb, Layout, theme } from 'antd';
import {Sidebar} from "./Sidebar.tsx";
import {HeaderLayout} from "./Header.tsx";
import {EmployeesTable} from "../employees/EmployeesTable.tsx";

const {Content, Footer} = Layout;


const AppLayout: React.FC = () => {

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
                    <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: 'Главная' }, { title: 'Сотрудники' }]} />
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                       <EmployeesTable/>
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