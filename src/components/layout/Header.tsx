import {RobotOutlined, UserOutlined} from "@ant-design/icons";
import {Header} from "antd/es/layout/layout";

export const HeaderLayout = () => {

    return (
        <Header className={'bg-white flex items-center gap-5'}>
            <h1 className={'text-xl'}><RobotOutlined /> Профиль пользователя:</h1> <UserOutlined className={'text-2xl'}/> vasya@yrzum76.su
        </Header>
    )
}