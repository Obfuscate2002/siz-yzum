import {Button, Form, type GetProp, Modal, type ModalProps} from "antd";
import { createStaticStyles } from 'antd-style';
import {useState} from "react";
import {EmployeesForm} from "./EmployeesForm.tsx";
import {PlusCircleOutlined} from "@ant-design/icons";
import type {ContractPosition} from "../../types/contractPositions.ts";
import type {Division} from "../../types/divisions.ts";



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

interface EmployeeModalProps {
    loadData: () => Promise<void>;
    allContractPositions: ContractPosition[];
    allDivisions: Division[];
}

export const EmployeeModal = ({loadData, allDivisions, allContractPositions}: EmployeeModalProps) => {
    const [modalFnOpen, setModalFnOpen] = useState(false);
    const [form] = Form.useForm();
    const handleClose = () => {
        form.resetFields();
        setModalFnOpen(false);
    }

    const handleSuccess = () => {
        setModalFnOpen(false);
        loadData();
    }

    const sharedProps: ModalProps = {
        centered: true,
        classNames,
    };

    const footer: React.ReactNode = (
        <>
            <Button
                variant={"filled"}
                color={'default'}
                onClick={() => handleClose}
            >
                Cancel
            </Button>
            <Button
                variant={"filled"}
                color={"blue"}
                onClick={() => form.submit()}
            >
                Добавить сотрудника
            </Button>
        </>
    );

    return (
        <div className={'ml-3'}>
            <Button variant={"filled"} color={"blue"} onClick={() => setModalFnOpen(true)}>
                <PlusCircleOutlined /> Добавить сотрудника
            </Button>
            <Modal
                {...sharedProps}
                footer={footer}
                title="Добавить сотрудника"
                styles={stylesFn}
                mask={{ enabled: true, blur: true }}
                open={modalFnOpen}
                onOk={() => setModalFnOpen(false)}
                onCancel={() => setModalFnOpen(false)}
                destroyOnHidden
            >
                <EmployeesForm
                    form={form}
                    onSuccess={handleSuccess}
                    allDivisions={allDivisions}
                    allContractPositions={allContractPositions}
                />
            </Modal>
        </div>
    )
}