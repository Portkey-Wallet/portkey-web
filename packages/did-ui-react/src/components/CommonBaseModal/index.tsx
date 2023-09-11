import { Modal, ModalProps } from 'antd';
import clsx from 'clsx';
import './index.less';

export type ICommonBaseModalProps = ModalProps & { onClose?: () => void };
export default function CommonBaseModal({
  wrapClassName,
  className,
  width = 430,
  maskClosable = true,
  closable = false,
  centered = true,
  footer = null,
  onClose,
  onCancel,
  ...props
}: ICommonBaseModalProps) {
  return (
    <Modal
      {...props}
      wrapClassName={clsx(['portkey-ui-common-base-modal', wrapClassName])}
      className={clsx(['portkey-ui-base-modal', className])}
      width={width}
      maskClosable={maskClosable}
      closable={closable}
      centered={centered}
      onCancel={onClose || onCancel}
      footer={footer}
    />
  );
}
