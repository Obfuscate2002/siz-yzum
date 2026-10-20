
import {
    Button,
    Col,
    Divider,
    Drawer,
    type DrawerProps,
    Flex,
    Form,
    type GetProp,
    Input,
    InputNumber,
    Row,
    Typography
} from "antd";
import Text from "antd/es/typography/Text";
import {createStaticStyles} from "antd-style";
import type {PpeIssuanceStandard} from "../../types/ppeIssuanceStandards.ts";
const headerText = (ppeIssuanceStandard: PpeIssuanceStandard | undefined) => {
    return (
        <div className={'flex flex-col'}>
            <Row>
                <Col span={20}>
                    <Typography.Title level={1}>{ppeIssuanceStandard?.position_name}</Typography.Title>
                    <span></span>
                </Col>
                <Col span={4} className={'flex justify-center items-center p-1'}>
                    <Text type={'secondary'} className={'border border-gray-300 p-1 rounded-lg'}>Просмотр</Text>
                </Col>
            </Row>
        </div>
    )
}

const sharedContent = (ppeIssuanceStandard: PpeIssuanceStandard | undefined) => {

    return (
        <>
            <Typography.Title level={3}>
                Данные сотрудника: {ppeIssuanceStandard?.position_name}
            </Typography.Title>
            <div className={'grid grid-cols-2 gap-4'}>
                <div className={'flex flex-col'}>
                    <Text strong></Text>
                    <Text></Text>
                </div>
                <div className={'flex flex-col'}>
                    <Text strong></Text>
                    <Text></Text>
                </div>
                <div className={'flex flex-col'}>
                    <Text strong></Text>
                    <Text></Text>
                </div>
                <div className={'flex flex-col'}>
                    <Text strong></Text>
                    <Text></Text>
                </div>
                <div className={'flex flex-col'}>
                    <Text strong></Text>
                    <Text></Text>
                </div>
                <div className={'flex flex-col'}>
                    <Text strong></Text>
                    <Text></Text>
                </div>
                <div className={'flex flex-col'}>
                    <Text strong></Text>
                    <Text></Text>
                </div>
            </div>
            <div className={'flex justify-end'}>
                <Button className={' m-1'}>Редактировать</Button>
            </div>
            <Divider/>
            <Typography.Title level={3}>
                Нормы выдачи СИЗ:
            </Typography.Title>

            <Form layout={"vertical"}>
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
    selectedPpeIssuanceStandardId: string | null;
    onClose: () => void;
    ppeIssuanceStandard: PpeIssuanceStandard | undefined;
}

export const PpeIssuanceStandardRecord = ({selectedPpeIssuanceStandardId, ppeIssuanceStandard, onClose}: SelectProp) => {
    const sharedProps: DrawerProps = {
        classNames,
        size: 800,
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
        <>
            <Drawer
                {...sharedProps}
                footer={footer}
                title={headerText(ppeIssuanceStandard)}
                styles={stylesFn}
                mask={{ enabled: true, blur: true }}
                open={selectedPpeIssuanceStandardId !== null}
                onClose={onClose}
                closable={false}
            >
                {sharedContent(ppeIssuanceStandard)}
            </Drawer>
        </>
    )
}