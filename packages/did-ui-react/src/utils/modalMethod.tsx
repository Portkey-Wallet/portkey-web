import { ModalFuncProps } from 'antd';
import { PORTKEY_PREFIX_CLS } from '../constants';
import { Modal } from '../components/CustomAnt';

export function modalMethod({
  type = 'confirm',
  wrapClassName = '',
  className,
  onOk,
  onCancel,
  ...props
}: ModalFuncProps): Promise<boolean> {
  return new Promise((resolve) => {
    Modal[type]({
      width: 320,
      icon: null,
      centered: true,
      okText: 'Confirm',
      ...props,
      wrapClassName: 'portkey-ui-wrapper portkey-ui-modal-method-wrapper ' + wrapClassName,
      className: 'portkey-ui-modal-method ' + className,
      prefixCls: `${PORTKEY_PREFIX_CLS}-modal`,
      onOk: () => {
        onOk?.();
        resolve(true);
      },
      onCancel: () => {
        onCancel?.();
        resolve(false);
        // modal.destroy();
      },
    });
  });
}
