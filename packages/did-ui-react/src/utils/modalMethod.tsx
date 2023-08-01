import { ModalFuncProps, Modal } from 'antd';

export function modalMethod({ type, wrapClassName, className, ...props }: Omit<ModalFuncProps, 'onOk' | 'onCancel'>) {
  return new Promise((resolve, reject) => {
    if (!type) return reject('type is required');
    Modal[type]({
      width: 320,
      icon: null,
      centered: true,
      okText: 'Confirm',
      ...props,
      wrapClassName: 'portkey-ui-wrapper portkey-ui-modal-method-wrapper ' + wrapClassName,
      className: 'portkey-ui-modal-method ' + className,
      onOk: () => {
        resolve(true);
      },
      onCancel: () => {
        resolve(false);
      },
    });
  });
}
