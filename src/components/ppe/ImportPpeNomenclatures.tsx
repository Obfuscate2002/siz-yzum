import {UploadOutlined} from "@ant-design/icons";
import {Button} from "antd";

export const ImportPpeNomenclatures = () => {

    return (
        <Button
            icon={<UploadOutlined />}
        >
            Импорт Номенклатуры из CSV
        </Button>
    )
}