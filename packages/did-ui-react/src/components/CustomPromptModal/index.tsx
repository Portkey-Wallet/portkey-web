import { Modal, ModalProps } from 'antd';
import './index.less';
import { PORTKEY_PREFIX_CLS } from '../../constants';

export type ICustomTokenModalProps = ModalProps & { onClose: () => void };
export default function CustomPromptModal({ onClose, ...props }: ICustomTokenModalProps) {
  return (
    <Modal
      {...props}
      wrapClassName="custom-prompt-modal"
      maskClosable={true}
      closable={false}
      centered={true}
      prefixCls={`${PORTKEY_PREFIX_CLS}-modal`}
      onCancel={onClose}
      footer={null}
    />
  );
}
