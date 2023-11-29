import { ModalFuncProps } from 'antd';
import { Modal } from '../../CustomAnt';

export function modalMethod({
  type = 'confirm',
  wrapClassName = '',
  className,
  onOk,
  onCancel,
  ...props
}: ModalFuncProps) {
  return new Promise((resolve) => {
    Modal[type]({
      width: 320,
      icon: null,
      centered: true,
      okText: 'Confirm',
      ...props,
      wrapClassName: 'portkey-ui-wrapper portkey-ui-modal-method-wrapper ' + wrapClassName,
      className: 'portkey-ui-modal-method ' + className,
      onOk: () => {
        onOk?.();
        resolve(true);
      },
      onCancel: () => {
        onCancel?.();
        resolve(false);
      },
    });
  });
}
