import {
    Drawer,
    type DrawerProps,
    type GetProp,
    Button,
    Form,
    Input,
    Typography,
    Row,
    Col, Divider, message, Popconfirm, Tag, DatePicker, Select
} from "antd";
import dayjs, {Dayjs} from "dayjs";
import {createStaticStyles} from "antd-style";
import Text from "antd/es/typography/Text";
import {EmployeeRecordTable} from "./EmployeeRecordTable.tsx";
import type {Employee} from "../../types/employee.ts";
import {useEffect, useState} from "react";
import {deleteEmployee, updateEmployee} from "../../hooks/useEmployess.tsx";
import type {PpeIssuanceStandardExpanded} from "../../types/ppeIssuanceStandards.ts";
import type {ContractPosition} from "../../types/contractPositions.ts";
interface EmployeeFormValues {
    fullName: string;
    position: string;
    unit: string;
    personnelNumber: string;
    contractPosition: string;
    date_of_employment: Dayjs | null;
    height: string;
    clothingSize: string;
    shoeSize: string;
    comment: string;
}

interface HeaderTextProps {
    employee?: Employee;
    isEdit: boolean;
}

const HeaderText = ({employee, isEdit}: HeaderTextProps) => {
    return (
        <div className={'flex flex-col'}>
            <Row>
                <Col span={20}>
                    <Typography.Title level={1}>Карточка сотрудника</Typography.Title>
                    <span>{`Табельный номер: ${employee?.personnelNumber}`}</span>
                </Col>
                <Col span={4} className={'flex justify-center items-center p-1'}>
                    {isEdit ? (
                        <Tag className={'p-2'} variant={'outlined'} color={'blue'}>Редактирование</Tag>
                    ) : (
                        <Tag className={'p-2'} variant={'outlined'} color={'gray'}>Просмотр</Tag>
                    )}
                </Col>
            </Row>
        </div>
    )
}

interface SharedContentProps {
    employee?: Employee;
    isEdit: boolean;
    setEdit: (value: boolean) => void;
    handleDelete: () => void;
    ppeIssuanceStandards?: PpeIssuanceStandardExpanded[];
    onEmployeeUpdated: (employee: Employee) => void;
    allContractPositions?: ContractPosition[];
}

const SharedContent = ({employee, isEdit, setEdit, handleDelete, ppeIssuanceStandards, onEmployeeUpdated,allContractPositions}: SharedContentProps) => {

    const [loading, setLoading] = useState(false);

    const formatDateOfEmployment = (date?: string) => {
        if(!date) return;

        return new Intl.DateTimeFormat("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(new Date(date));
    }

    const [form] = Form.useForm();

    const setEmployeeFormValues = (employee: Employee) => {
        form.setFieldsValue({
            fullName: employee.fullName,
            position: employee.position,
            division: employee.expand?.division?.name ?? "",
            contractPosition: employee.contractPosition,
            personnelNumber: employee.personnelNumber,
            date_of_employment: employee.date_of_employment
                ? dayjs(employee.date_of_employment)
                : null,
            height: String(employee.height ?? ""),
            clothingSize: String(employee.clothingSize ?? ""),
            shoeSize: String(employee.shoeSize ?? ""),
            comment: employee.comment ?? "",
        });
    };

    useEffect(() => {
        if(!employee) return;

        setEmployeeFormValues(employee);

    }, [employee, form])

    const handleCancelEdit = () => {
        if (employee) {
            setEmployeeFormValues(employee);
        }

        setEdit(false);
    }

    const handleSave = async (values: EmployeeFormValues) => {
        if (!employee) return;
        setLoading(true);
        try {
            const updatedEmployee = await updateEmployee(employee.id, {
                ...values,
                contractPosition: values.contractPosition,
                date_of_employment: values.date_of_employment
                    ? values.date_of_employment.format("YYYY-MM-DD")
                    : "",
            });

            message.success("Данные сотрудника успешно обновлены");

            onEmployeeUpdated(updatedEmployee);
            setEdit(false);
        } catch (error) {
            console.error("Ошибка обновления сотрудника:", error);
            message.error("Ошибка обновления данных");
        } finally {
            setLoading(false);
        }
    }

    const handleStartEdit = () => {
        if (employee) {
            setEmployeeFormValues(employee);
        }

        setEdit(true);
    }

    return (
        <>
        <Typography.Title level={3}>
            Данные сотрудника:
        </Typography.Title>
            <Divider/>
            {isEdit ? (
                <>
                    <Form layout={"vertical"} form={form} onFinish={handleSave}>
                        <div className={'grid grid-cols-2 gap-4'}>
                            <Form.Item label={'Фио'} name={'fullName'}>
                                <Input/>
                            </Form.Item>
                            <Form.Item label={'Должность по трудовому договору'} name={'contractPosition'}>
                                <Select
                                    options={(allContractPositions ?? []).map((item) => ({
                                    label: item.name,
                                    value: item.id
                                }))}/>
                            </Form.Item>
                            <Form.Item label={'Подразделение'} name={'division'}>
                                <Input/>
                            </Form.Item>
                            <Form.Item label={'Табельный номер'} name={'personnelNumber'}>
                                <Input/>
                            </Form.Item>
                            <Form.Item label={'Дата приема на работу'} name={'date_of_employment'}>
                                <DatePicker
                                    className="w-full"
                                    placeholder="Выберите дату"
                                    format="DD.MM.YYYY"
                                />
                            </Form.Item>
                            <Form.Item label={'Рост'} name={'height'}>
                                <Input/>
                            </Form.Item>
                            <Form.Item label={'Размер одежды'} name={'clothingSize'}>
                                <Input/>
                            </Form.Item>
                            <Form.Item label={'Размер обуви'} name={'shoeSize'}>
                                <Input/>
                            </Form.Item>
                            <Form.Item label={'Комментарий'} name={'comment'}>
                                <Input.TextArea/>
                            </Form.Item>
                        </div>

                        <div className={'flex flex-row justify-end gap-1'}>
                            <Button onClick={handleCancelEdit}>Отмена</Button>
                            <Button htmlType={'submit'} loading={loading}>Сохранить</Button>
                        </div>
                    </Form>
                </>
            ) : (
                <div className={'grid grid-cols-2 gap-4'}>
                    <div className={'flex flex-col'}>
                        <Text strong>ФИО</Text>
                        <Text>{employee?.fullName}</Text>
                    </div>
                    <div className={'flex flex-col'}>
                        <Text strong>Должность по трудовому договору</Text>
                        <Text>{employee?.expand?.contractPosition?.name}</Text>
                    </div>
                    <div className={'flex flex-col'}>
                        <Text strong>Подразделение</Text>
                        <Text>{employee?.expand?.division?.name}</Text>
                    </div>
                    <div className={'flex flex-col'}>
                        <Text strong>Табельный номер</Text>
                        <Text>{employee?.personnelNumber}</Text>
                    </div>
                    <div className={'flex flex-col'}>
                        <Text strong>Дата приема на работу</Text>
                        <Text>{employee?.date_of_employment === '' ? 'Не указано' : formatDateOfEmployment(employee?.date_of_employment)}</Text>
                    </div>
                    <div className={'flex flex-col'}>
                        <Text strong>Рост</Text>
                        <Text>{employee?.height}</Text>
                    </div>
                    <div className={'flex flex-col'}>
                        <Text strong>Размер одежды</Text>
                        <Text>{employee?.clothingSize}</Text>
                    </div>
                    <div className={'flex flex-col'}>
                        <Text strong>Размер обуви</Text>
                        <Text>{employee?.shoeSize}</Text>
                    </div>
                    <div className={'flex flex-col'}>
                        <Text strong>Комментарий</Text>
                        <Text>{employee?.comment === '' ? 'Не указано' :employee?.comment}</Text>
                    </div>
                    <div className={'flex justify-end'}>


                        <Button
                            color={'blue'}
                            variant={'filled'}
                            onClick={() => {handleStartEdit()}}
                            className={'m-1'}
                        >
                            Редактировать
                        </Button>

                        <Popconfirm
                            title={'Удалить сотрудника?'}
                            description={'Это действие нельзя отменить'}
                            okText={'Удалить'}
                            cancelText={'Отмена'}
                            okButtonProps={{danger: true}}
                            onConfirm={() => {handleDelete()}}
                        >
                            <Button
                                color={'danger'}
                                variant={'filled'}
                                className={'m-1'}
                            >
                                Удалить сотрудника
                            </Button>
                        </Popconfirm>

                    </div>
                </div>
            )}
            <Divider/>
            <Typography.Title level={3}>
                Нормы выдачи СИЗ:
            </Typography.Title>

            <EmployeeRecordTable
                positionId={employee?.positionRelation}
                ppeIssuanceStandards={ppeIssuanceStandards}
            />
        </>
    );
}



const classNames = createStaticStyles(
    ({ css }): NonNullable<GetProp<DrawerProps, 'classNames', 'Return'>> => ({
        root: css`
      border-radius: 10px;
      padding: 10px;
    `,
    }),
);


const stylesFn: DrawerProps['styles'] = (info): GetProp<DrawerProps, 'styles', 'Return'> => {
    if (info.props.footer) {
        return {
            header: {
                padding: 16,
            },
            body: {
                padding: 16,
            },
            footer: {
                padding: '16px 10px',
                backgroundColor: '#fafafa',
            },
        };
    }
};

type SelectProp = {
    selectedEmployeeId: string | null;
    onClose: () => void;
    employee: Employee | undefined;
    onDelete: () => void;
    ppeIssuanceStandards?: PpeIssuanceStandardExpanded[];
    onEmployeeUpdated: (employee: Employee) => void;
    allContractPositions?: ContractPosition[];
}

export const EmployeeRecord = ({selectedEmployeeId, onClose, employee, onDelete, ppeIssuanceStandards, onEmployeeUpdated, allContractPositions}: SelectProp) => {
    const [isEdit, setEdit] = useState(false);

    const handleDelete = async () => {
        if(employee === undefined) return;
        try {
            await deleteEmployee(employee.id)
            onDelete()
            onClose();
        } catch (error) {
            message.error('Ошибка удаления сотрудника');
        }
    }

    const handleClose = () => {
        setEdit(false);
        onClose();
    }

    const sharedProps: DrawerProps = {
        classNames,
        size: 1200,
    };



    return (
        <Drawer
            {...sharedProps}
            title={(<HeaderText
                employee={employee}
                isEdit={isEdit}
            />)}
            styles={stylesFn}
            mask={{ enabled: true, blur: true }}
            open={selectedEmployeeId !== null}
            onClose={handleClose}
            closable={false}
        >
            <SharedContent
                employee={employee}
                isEdit={isEdit}
                setEdit={setEdit}
                handleDelete={handleDelete}
                ppeIssuanceStandards={ppeIssuanceStandards}
                onEmployeeUpdated={onEmployeeUpdated}
                allContractPositions={allContractPositions}
            />
        </Drawer>
    )


}