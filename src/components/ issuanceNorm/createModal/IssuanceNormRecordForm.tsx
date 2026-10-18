import {Form, type FormInstance, Input, message} from "antd";
import {pb} from "../../../pocketbase/pocketbase.ts";
import {SelectSizNomenclature} from "./SelectSizNomenclature.tsx";
import Text from "antd/es/typography/Text";
import type {IssuanceNormHeaderExpanded} from "../../../types/norms.ts";
import {InfoCircleTwoTone} from "@ant-design/icons";

interface Props {
    form: FormInstance,
    onSuccess?: () => void,
    issuanceNorm: IssuanceNormHeaderExpanded | undefined,
}

type DataProps = {
    fullName: string,
    position: string,
    unit: string,
    createdAt: string,
    personnelNumber: string,
}

export const IssuanceNormRecordForm = ({form, onSuccess, issuanceNorm}: Props) => {
    const handleSubmit = async (values: DataProps) => {
        try {
            await pb.collection('employees').create({
                fullName: values.fullName,
                position: values.position,
                unit: values.unit,
                personnelNumber: values.personnelNumber,
            })
            message.success("Сотрудник добавлен")
            onSuccess?.()
        } catch (error) {
            message.error(error instanceof Error ? error.message : 'Не удалось добавить сотрудника');
        }
    }

    return (
        <div className={'flex flex-col'}>
            <div className={'flex flex-row gap-3 bg-blue-400/10 mb-3 rounded-xl items-center justify-start p-2'}>
                <div className={'items-center'}>
                    <InfoCircleTwoTone />
                </div>
                <div className={'flex flex-col '}>
                    <Text>Выбранная должность: <Text strong>{issuanceNorm?.expand?.position?.name}</Text></Text>
                    <Text>Норма выдачи: <Text strong>{issuanceNorm?.name}</Text></Text>
                </div>
            </div>


            <Form form={form} onFinish={handleSubmit}>
                <div className={'flex flex-col gap-5'}>
                    <div>
                        <SelectSizNomenclature/>
                    </div>
                    <div className={'flex flex-row gap-3'}>
                        <Form.Item layout={"vertical"} label="Количество" required>
                            <Input placeholder="кол-во" />
                        </Form.Item>
                        <Form.Item layout={"vertical"} label="Период, мес." required>
                            <Input placeholder="кол-во" />
                        </Form.Item>
                    </div>
                    <Form.Item layout={"vertical"} label="Комментарий">
                        <Input.TextArea placeholder="Введите комментарий (необязательно)" />
                    </Form.Item>
                </div>
            </Form>
        </div>

    )
}