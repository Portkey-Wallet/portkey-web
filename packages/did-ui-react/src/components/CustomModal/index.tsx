import { ReactNode } from 'react';
import './index.less';
import { Modal } from '../CustomAnt';
import clsx from 'clsx';

export interface ICustomModalProps {
  className?: string;
  type?: 'info' | 'confirm';
  content: ReactNode;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
}

const CustomModal = ({ className, type, content, okText, onCancel, onOk, cancelText }: ICustomModalProps) => {
  const props = {
    open: true,
    width: 320,
    icon: null,
    closable: false,
    centered: true,
    autoFocusButton: null,
    okButtonProps: {
      loading: false,
    },
  };

  return type === 'confirm'
    ? Modal.confirm({
        ...props,
        className: clsx('confirm-modal', className),
        okText: okText || 'OK',
        cancelText: cancelText || 'Cancel',
        content,
        onOk: onOk,
        onCancel: onCancel,
      })
    : Modal.info({
        ...props,
        className: clsx('info-modal', className),
        okText: okText || 'OK',
        content,
        onOk: onOk,
      });
};

export default CustomModal;
