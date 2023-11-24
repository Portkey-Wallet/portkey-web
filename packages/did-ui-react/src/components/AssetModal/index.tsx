import { ModalProps } from 'antd';
import CommonModal from '../CommonModal';
import clsx from 'clsx';
import './index.less';

export default function AssetModal({ onCancel, wrapClassName, maskClosable = true, ...props }: ModalProps) {
  return (
    <CommonModal
      maskClosable={maskClosable}
      width={430}
      {...props}
      closable={false}
      wrapClassName={clsx('portkey-ui-custom-token-modal', wrapClassName)}
      onCancel={onCancel}
    />
  );
}
