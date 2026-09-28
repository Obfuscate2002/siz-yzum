import { Breadcrumb, Layout, theme } from 'antd';
import {Sidebar} from "./Sidebar.tsx";
import {HeaderLayout} from "./Header.tsx";

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
                    <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: 'User' }, { title: 'Bill' }]} />
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        Bill is a cat.
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Ant Design ©{currentYear} Created by Ant UED
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AppLayout;