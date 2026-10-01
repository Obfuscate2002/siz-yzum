
import {Header} from "antd/es/layout/layout";

export const HeaderLayout = () => {

    return (
        <Header className={'bg-white flex flex-col p-5 w-auto h-auto'}>
                <h1 className="text-2xl font-bold">СИЗ</h1>
                <span className="text-lg text-black/60">Управление средствами индивидуальной защиты</span>
        </Header>
    )
}