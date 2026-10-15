import {Drawer, type DrawerProps, type GetProp, Flex, Button, Form, Input, InputNumber} from "antd";
import {createStaticStyles} from "antd-style";



const sharedContent = (
    <>
        <Form>
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
        </Form>
    </>
);

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
}

export const EmployeeRecord = ({selectedEmployeeId, onClose}: SelectProp) => {
    const sharedProps: DrawerProps = {
        classNames,
        size: 500,
    };

    const footer: React.ReactNode = (
        <Flex gap="medium" justify="flex-end">
            <Button
                styles={{ root: { borderColor: '#ccc', color: '#171717', backgroundColor: '#fff' } }}
                onClick={onClose}
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
            title="Карточка сотрудника"
            styles={stylesFn}
            mask={{ enabled: true, blur: true }}
            open={selectedEmployeeId !== null}
            onClose={onClose}
        >
            {sharedContent}
        </Drawer>
    )


}