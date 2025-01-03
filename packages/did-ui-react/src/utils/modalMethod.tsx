import { ModalFuncProps } from 'antd';
import { PORTKEY_PREFIX_CLS } from '../constants';
import { Modal } from '../components/CustomAnt';
import { ModalFunc } from '../components/CustomAnt/antd/modal/comfirm';

export type TModalMethodRef = {
  current?: ReturnType<ModalFunc> & {
    close: () => void;
  };
};

export type CloseValue = 0;

export function modalMethod({
  type = 'confirm',
  wrapClassName = '',
  className,
  ref,
  onOk,
  onCancel,
  ...props
}: ModalFuncProps & {
  ref?: TModalMethodRef;
}): Promise<boolean | 0> {
  return new Promise((resolve) => {
    if (!ref) ref = { current: undefined };

    const modal = Modal[type]({
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

    ref.current = {
      destroy: modal.destroy,
      update: modal.update,
      close: () => {
        modal.destroy();
        resolve(0);
      },
    };

    console.log(ref.current, modal);
  });
}
