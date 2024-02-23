import { ModalFuncProps } from 'antd';
import { Modal } from '../../CustomAnt';
import { PORTKEY_PREFIX_CLS } from '../../../constants';

export function modalMethod({
  type = 'confirm',
  wrapClassName = '',
  className,
  onOk,
  onCancel,
  ...props
}: ModalFuncProps) {
  return Modal[type]({
    width: 320,
    icon: null,
    centered: true,
    okText: 'Confirm',
    ...props,
    wrapClassName: 'portkey-ui-wrapper portkey-ui-modal-method-wrapper ' + wrapClassName,
    className: 'portkey-ui-modal-method ' + className,
    prefixCls: `${PORTKEY_PREFIX_CLS}-modal`,
    onOk: onOk,
    onCancel: onCancel,
  });
}
