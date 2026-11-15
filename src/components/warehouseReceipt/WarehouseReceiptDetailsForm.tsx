import {DatePicker, Form, type FormInstance, Input, Row, Select} from "antd";
import {useCounterparties} from "../../hooks/useCounterparties.ts";


export interface WarehouseReceiptDetailsValues {
    documentNumber: string;
    receiptDate: import("dayjs").Dayjs;
    counterparty: string;
    basis?: string;
}

interface WarehouseReceiptDetailsFormProps {
    form: FormInstance<WarehouseReceiptDetailsValues>
}

export const WarehouseReceiptDetailsForm = ({form}: WarehouseReceiptDetailsFormProps) => {

    const {
        data: counterparties = [],
        isLoading,
        isError,
    } = useCounterparties()


    const options = counterparties.map((item => ({
        value: item.id,
        label: `${item.name} (ИНН: ${item.inn}, КПП: ${item.kpp})`,
        searchText: `${item.name} ${item.inn} ${item.kpp}`.toLowerCase(),
    })))

    return (
        <Form form={form} layout="vertical">
            <Row className="gap-10">
                <Form.Item
                    name="documentNumber"
                    className={'w-50'}
                    label="Номер документа"
                    rules={[{required: true, message: 'Введите номер документа'}]}>
                    <Input placeholder={'Введите номер накладной'}/>
                </Form.Item>
                <Form.Item
                    name="receiptDate"
                    label="Дата документа"
                    rules={[{required: true, message: 'Введите дату'}]}>
                    <DatePicker
                        className="w-full"
                        format="DD.MM.YYYY"
                    />
                </Form.Item>
                <Form.Item
                    label="Контрагент"
                    name="counterparty"
                    className="min-w-[700px]"
                    rules={[
                        {
                            required: true,
                            message: 'Укажите контрагента',
                        },
                    ]}
                >
                    <Select
                        showSearch
                        placeholder={'Выберите контрагента'}
                        loading={isLoading}
                        disabled={isError}
                        options={options}
                        notFoundContent={
                            isError
                                ? 'Ошибка загрузки контрагентов'
                                : isLoading
                                    ? 'Загрузка'
                                    : 'Контрагенты не найдены'
                        }
                    />
                </Form.Item>
            </Row>

        </Form>
    )
}