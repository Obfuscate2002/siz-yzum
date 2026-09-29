import {Button, Form, type GetProp, Modal, type ModalProps} from "antd";
import { createStaticStyles } from 'antd-style';
import {useState} from "react";
import {EmployeesForm} from "./EmployeesForm.tsx";
import {PlusCircleOutlined} from "@ant-design/icons";

const classNames = createStaticStyles(({ css }) => ({
    container: css`
    border-radius: 10px;
    padding: 10px;
  `,
}));

const stylesFn: ModalProps['styles'] = (info): GetProp<ModalProps, 'styles', 'Return'> => {
    if (info.props.footer) {
        return {
            container: {
                borderRadius: 14,
                border: '1px solid #ccc',
                padding: 0,
                overflow: 'hidden',
            },
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
    return {};
};

export const EmployeeModal = () => {
    const [modalFnOpen, setModalFnOpen] = useState(false);

    const [form] = Form.useForm();

    const handleClose = () => {
        form.resetFields();
        setModalFnOpen(false);
    }

    const handleSuccess = () => {
        setModalFnOpen(false);
    }

    const sharedProps: ModalProps = {
        centered: true,
        classNames,
    };

    const footer: React.ReactNode = (
        <>
            <Button
                onClick={() => handleClose}
                styles={{ root: { borderColor: '#ccc', color: '#171717', backgroundColor: '#fff' } }}
            >
                Cancel
            </Button>
            <Button
                type="primary"
                styles={{ root: { backgroundColor: '#171717' } }}
                onClick={() => form.submit()}
            >
                Добавить сотрудника
            </Button>
        </>
    );

    return (
        <div className={'ml-3'}>
            <Button type="primary" onClick={() => setModalFnOpen(true)}>
                <PlusCircleOutlined /> Добавить сотрудника
            </Button>
            <Modal
                {...sharedProps}
                footer={footer}
                title="Custom Function Modal"
                styles={stylesFn}
                mask={{ enabled: true, blur: true }}
                open={modalFnOpen}
                onOk={() => setModalFnOpen(false)}
                onCancel={() => setModalFnOpen(false)}
                destroyOnHidden
            >
                <EmployeesForm form={form} onSuccess={handleSuccess}/>
            </Modal>
        </div>


    )
}