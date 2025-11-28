import CommonModal, { CommonModalProps } from '../CommonModal';
import clsx from 'clsx';
import './index.less';

export default function AssetModal({ onClose, wrapClassName, ...props }: CommonModalProps) {
  return (
    <CommonModal
      width={430}
      {...props}
      wrapClassName={clsx('portkey-ui-custom-token-modal', wrapClassName)}
      onClose={onClose}
    />
  );
}
