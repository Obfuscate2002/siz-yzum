    import {CheckOutlined, FileTextTwoTone, PlusOutlined} from "@ant-design/icons";
    import {
    Button,
    Col,
    DatePicker,
    type DatePickerProps,
    Form,
    Input,
        message,
    Row,
    Select,
    Table,
    Typography
} from "antd";
    import {useEffect, useState} from "react";
    import type {PpeIssuanceStatement} from "../types/PpeIssuanceStatement.ts";
    import {getPpeIssuanceStatements} from "../hooks/usePpeIssuanceStatements.tsx";
    import type {PpeIssuanceStatementItem} from "../types/PpeIssuanceStatementItem.ts";
    import {getPpeIssuanceStatementItems} from "../hooks/usePpeIssuanceStatementItems.tsx";
    import type {Division} from "../types/divisions.ts";
    import {getDivisions} from "../hooks/useDivisions.tsx";
    import type {Employee} from "../types/employee.ts";
    import {getEmployes} from "../hooks/useEmployess.tsx";
    import type {ColumnsType} from "antd/es/table";
    export const PagePpeIssuanceStatements = () => {

        const [ppeIssuanceStatements, setPpeIssuanceStatements] = useState<PpeIssuanceStatement[]>([]);
        const [ppeIssuanceStatementItems, setPpeIssuanceStatementItems] = useState<PpeIssuanceStatementItem[]>([])
        const [allDivisions, setAllDivisions] = useState<Division[]>([])
        const [allEmployees, setAllEmployees] = useState<Employee[]>([])
        const [form] = Form.useForm();

        console.log(ppeIssuanceStatements)

        const onChange: DatePickerProps['onChange'] = (date, dateString) => {
            console.log(date, dateString);
        };

        const loadData = async () => {
            try {
                setPpeIssuanceStatements(await getPpeIssuanceStatements());
                setPpeIssuanceStatementItems(await getPpeIssuanceStatementItems())
                setAllDivisions(await getDivisions())
                setAllEmployees(await getEmployes())
            } catch (error) {
                message.error("Ошибка запроса данных");
            }
        }

        useEffect(() => {
            void loadData();
        }, [])


        const columns: ColumnsType<PpeIssuanceStatementItem> = [
            {
                title: 'Сотрудник',
                dataIndex: 'employee',
                key: 'employee',
                render: (_: unknown, record: PpeIssuanceStatementItem) => {
                    return record.expand?.employee?.name ?? '-';
                },
            },
            {
                title: 'Должность',
                dataIndex: 'contractPosition',
                key: 'contractPosition',
                render: (_: unknown, record: PpeIssuanceStatementItem) => {
                    return record.expand?.contractPosition?.name ?? '-';
                },
            },
            {
                title: 'СИЗ',
                dataIndex: 'warehouse_nomenclature',
                key: 'warehouse_nomenclature',
                render: (_: unknown, record: PpeIssuanceStatementItem) => {
                    return record.expand?.warehouse_nomenclature?.name ?? '-';
                },
            },
            {
                title: 'Количество',
                dataIndex: 'quantity',
                key: 'quantity',
            },
            {
                title: 'Ед. изм.',
                dataIndex: 'unit',
                key: 'unit',
            },
            {
                title: 'Срок носки',
                dataIndex: 'wearPeriod',
                key: 'wearPeriod',
            },
            {
                title: 'Ед. изм. периода износа',
                dataIndex: 'wearPeriodUnit',
                key: 'wearPeriodUnit',
                render: (_: unknown, record) => {
                    return record.wearPeriodUnit === 'year' ? 'год' : record.wearPeriodUnit;
                }
            },
        ];

        return (
            <>
                <Typography.Title level={2}><FileTextTwoTone /> Ведомость выдачи СИЗ</Typography.Title>
                <Form form={form}>
                    <div className={'flex flex-col gap-5'}>
                        <div className={'bg-blue-300/20 p-3 rounded-lg'}>
                            <Typography.Title level={3} className={'border-l-4 border-blue-500 pl-3'}>Реквизиты ведомости</Typography.Title>
                            <Row gutter={55}>
                                <Col span={12}>
                                <Form.Item
                                    name={'statementNumber'}
                                    label={'Номер ведомости:'}
                                    layout={'vertical'}
                                    rules={[
                                        {
                                            required: true, message: 'Заполните поле'
                                        }
                                    ]}>
                                    <Input
                                        variant={'underlined'}
                                        placeholder={'Введите номер ведомости'}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    name={'statementDate'}
                                    label={'Дата составления:'}
                                    layout={'vertical'}
                                >
                                    <DatePicker
                                        onChange={onChange}
                                        variant={'underlined'}
                                        placeholder={'Выберите дату'}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={'division'}
                                    label={'Подразделение:'}
                                    layout={'vertical'}
                                    rules={[
                                        {
                                            required: true, message: 'Выберите подразделение'
                                        }
                                    ]}>
                                    <Select
                                        variant={'underlined'}
                                        placeholder={'Выберите подразделение'}
                                        options={allDivisions.map((item) => ({
                                            label: item.name,
                                            value: item.id
                                        }))}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={'responsibleEmployee'}
                                    label={'Ответственное лицо:'}
                                    layout={'vertical'}
                                    rules={[
                                        {
                                            required: true, message: 'Выберите ответственное лицо'
                                        }
                                    ]}>
                                    <Select
                                        variant={'underlined'}
                                        placeholder={'Выберите ответственное лицо'}
                                        options={allEmployees.map((item) => ({
                                            label: item.fullName,
                                            value: item.id
                                        }))}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={'division'}
                                    label={'Основание:'}
                                    layout={'vertical'}
                                >
                                    <Input variant={'filled'} placeholder={'Основание'} disabled={true}/>
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                        <div className={'bg-gray-200/20 p-3 rounded-lg'}>
                            <div className={'flex justify-between gap-5'}>
                                <Typography.Title level={3} className={'border-l-4 border-gray-500 pl-3'}>Список выдачи СИЗ</Typography.Title>
                                <Button variant={'dashed'} color={'blue'}><PlusOutlined />Добавить позицию</Button>
                            </div>

                            <div>
                                <Table rowKey={'id'} dataSource={ppeIssuanceStatementItems} columns={columns} pagination={false} />
                            </div>
                            <div className={'flex justify-end mt-3 mb-1'}>
                                <Button variant={'solid'} color={'blue'}><CheckOutlined />Сформировать ведомость</Button>
                            </div>
                        </div>
                    </div>
                </Form>
            </>
        )
    }