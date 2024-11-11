import React from 'react';
import { Modal, Result, Space, Typography } from 'antd';
import { ModalProps } from 'antd/lib/modal';

interface SuccessModalProps extends ModalProps {
    open: boolean;
    onClose: () => void;
    content: React.ReactNode;
}

const SuccessModal = ({
    open,
    onClose,
    content,
    ...modalProps
}: SuccessModalProps) => {
    return (
        <Modal
            {...modalProps}
            open={open}
            footer={false}
            style={{ maxWidth: 400, textAlign: "center" }}
            centered
            maskClosable={false}
            onCancel={onClose}
        >
            <Result
                status="success"
                subTitle={
                    content
                }
            />
        </Modal >
    );
};

export default SuccessModal;
