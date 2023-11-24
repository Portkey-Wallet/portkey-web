import clsx from 'clsx';
import PortkeyModal, { PortkeyModalProps } from '../PortkeyModal';
import './index.less';

export default function CommonBaseModal({
  wrapClassName,
  className,
  width = 430,
  maskClosable = true,
  closable = false,
  centered = true,
  footer = null,
  onClose,
  placement = 'bottom',
  ...props
}: PortkeyModalProps) {
  return (
    <PortkeyModal
      {...props}
      placement={placement}
      wrapClassName={clsx(['portkey-ui-common-base-modal', wrapClassName])}
      className={clsx(['portkey-ui-base-modal', className])}
      width={width}
      maskClosable={maskClosable}
      closable={closable}
      centered={centered}
      onClose={onClose}
      footer={footer}
    />
  );
}
