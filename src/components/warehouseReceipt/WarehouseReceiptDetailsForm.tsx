import {DatePicker, Form, Input, Row, Select} from "antd";

export const WarehouseReceiptDetailsForm = () => {

    return (
        <Form layout="vertical">
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
                    rules={[{required: true, message: 'Введите В'}]}>
                    <DatePicker
                        className="w-full"
                        format="DD.MM.YYYY"
                    />
                </Form.Item>
                <Form.Item
                    label="Контрагент"
                    name="counterparty"
                    rules={[
                        {
                            required: true,
                            message: 'Укажите контрагента',
                        },
                    ]}
                >
                    <Select placeholder={'Выберите контрагента'}/>
                </Form.Item>
            </Row>

        </Form>
    )
}