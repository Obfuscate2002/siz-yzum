import {Button, Form, type GetProp, Modal, type ModalProps} from "antd";
import { createStaticStyles } from 'antd-style';
import {useState} from "react";
import {PlusCircleOutlined} from "@ant-design/icons";
import {IssuanceNormRecordForm} from "./IssuanceNormRecordForm.tsx";
import type {IssuanceNormHeaderExpanded} from "../../../types/norms.ts";

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

type IssuanceNormRecordModalProps = {
    issuanceNorm: IssuanceNormHeaderExpanded | undefined;
}

export const IssuanceNormRecordModal = ({issuanceNorm}: IssuanceNormRecordModalProps) => {
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
                Отмена
            </Button>
            <Button
                type="primary"
                styles={{ root: { backgroundColor: '#171717' } }}
                onClick={() => form.submit()}
            >
                Добавить
            </Button>
        </>
    );

    return (
        <div className={'ml-3'}>
            <Button type="primary" onClick={() => setModalFnOpen(true)}>
                <PlusCircleOutlined /> Добавить
            </Button>
            <Modal
                {...sharedProps}
                footer={footer}
                title="Добавление СИЗ в норму"
                styles={stylesFn}
                mask={{ enabled: true, blur: true }}
                open={modalFnOpen}
                onOk={() => setModalFnOpen(false)}
                onCancel={() => setModalFnOpen(false)}
                destroyOnHidden
            >
                <IssuanceNormRecordForm issuanceNorm={issuanceNorm} form={form} onSuccess={handleSuccess}/>
            </Modal>
        </div>
    )
}