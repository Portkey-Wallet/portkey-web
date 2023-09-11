import { Modal, ModalProps } from 'antd';
import './index.less';

export type ICustomTokenModalProps = ModalProps & { onClose: () => void };
export default function CustomPromptModal({ onClose, ...props }: ICustomTokenModalProps) {
  return (
    <Modal
      {...props}
      wrapClassName="portkey-ui-prompt-modal"
      maskClosable={true}
      closable={false}
      centered={true}
      onCancel={onClose}
      footer={null}
    />
  );
}
