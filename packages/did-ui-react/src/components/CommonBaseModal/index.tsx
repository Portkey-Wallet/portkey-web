import { Modal, ModalProps } from 'antd';
import clsx from 'clsx';
import './index.less';
import { PORTKEY_PREFIX_CLS } from '../../constants';

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
      prefixCls={`${PORTKEY_PREFIX_CLS}-modal`}
      closable={closable}
      centered={centered}
      onCancel={onClose || onCancel}
      footer={footer}
    />
  );
}
