import {
    Drawer,
    type DrawerProps,
    type GetProp,
    Flex,
    Button,
    Form,
    Input,
    InputNumber,
    Typography,
    Row,
    Col, Divider
} from "antd";
import {createStaticStyles} from "antd-style";
import Text from "antd/es/typography/Text";
import {EmployeeRecordTable} from "./EmployeeRecordTable.tsx";
import type {Employee} from "../../types/employee.ts";
import {useState} from "react";


const headerText = (employee: Employee | undefined) => {
    return (
        <div className={'flex flex-col'}>

            <Row>
                <Col span={20}>
                    <Typography.Title level={1}>Карточка сотрудника</Typography.Title>
                    <span>{`Табельный номер: ${employee?.personnelNumber}`}</span>
                </Col>
                <Col span={4} className={'flex justify-center items-center p-1'}>
                    <Text type={'secondary'} className={'border border-gray-300 p-1 rounded-lg'}>Просмотр</Text>
                </Col>
            </Row>
        </div>
    )
}

interface SharedContentProps {
    employee?: Employee;
    isEdit: boolean;
    setEdit: (value: boolean) => void;
}

const SharedContent = ({employee, isEdit, setEdit}: SharedContentProps) => {

    const handleStartEdit = () => {
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
                    <Form layout={"vertical"}>
                        <div className={'grid grid-cols-2 gap-4'}>
                            <Form.Item label={'Фио'} name={'fullName'}>
                                <Input/>
                            </Form.Item>
                            <Form.Item label={'Должность'} name={'position'}>
                                <Input/>
                            </Form.Item>
                            <Form.Item label={'Подразделение'} name={'unit'}>
                                <Input/>
                            </Form.Item>
                            <Form.Item label={'Табельный номер'} name={'personnelNumber'}>
                                <InputNumber/>
                            </Form.Item>
                            <Form.Item label={'height'} name={'height'}>
                                <Input/>
                            </Form.Item>
                            <Form.Item label={'clothingSize'} name={'clothingSize'}>
                                <Input/>
                            </Form.Item>
                            <Form.Item label={'shoeSize'} name={'shoeSize'}>
                                <Input/>
                            </Form.Item>
                            <Form.Item label={'comment'} name={'comment'}>
                                <Input.TextArea/>
                            </Form.Item>
                        </div>

                        <div className={'flex flex-row justify-end gap-1'}>
                            <Button onClick={() => setEdit(false)}>Отмена</Button>
                            <Button>Сохранить</Button>
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
                        <Text strong>Должность</Text>
                        <Text>{employee?.position}</Text>
                    </div>
                    <div className={'flex flex-col'}>
                        <Text strong>Подразделение</Text>
                        <Text>{employee?.unit}</Text>
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
                        <Text>{employee?.comment === '' ? '-' :employee?.comment}</Text>
                    </div>
                    <div className={'flex justify-end'}>
                        <Button
                            onClick={() => {handleStartEdit()}}
                            className={'m-1'}
                        >
                            Редактировать
                        </Button>
                    </div>
                </div>
            )}
            <Divider/>
            <Typography.Title level={3}>
                Нормы выдачи СИЗ:
            </Typography.Title>

            <EmployeeRecordTable positionId={employee?.positionRelation}/>



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
}

export const EmployeeRecord = ({selectedEmployeeId, onClose, employee}: SelectProp) => {
    const [isEdit, setEdit] = useState(false);

    const handleClose = () => {
        setEdit(false);
        onClose();
    }

    const sharedProps: DrawerProps = {
        classNames,
        size: 800,
    };

    const footer: React.ReactNode = (
        <Flex gap="medium" justify="flex-end">
            <Button
                styles={{ root: { borderColor: '#ccc', color: '#171717', backgroundColor: '#fff' } }}
                onClick={handleClose}
            >
                Cancel
            </Button>
            <Button
                type="primary"
                styles={{ root: { backgroundColor: '#171717' } }}
            >
                Submit
            </Button>
        </Flex>
    );


    return (
        <Drawer
            {...sharedProps}
            footer={footer}
            title={headerText(employee)}
            styles={stylesFn}
            mask={{ enabled: true, blur: true }}
            open={selectedEmployeeId !== null}
            onClose={handleClose}
            closable={false}
        >
            <SharedContent
                employee={employee}
                isEdit={isEdit}
                setEdit={setEdit}/>
        </Drawer>
    )


}