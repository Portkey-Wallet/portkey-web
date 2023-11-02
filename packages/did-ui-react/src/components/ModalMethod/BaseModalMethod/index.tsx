import { Modal, ModalFuncProps } from 'antd';
import { PORTKEY_PREFIX_CLS } from '../../../constants';
import clsx from 'clsx';
import './index.less';

export interface BaseModalFuncProps extends ModalFuncProps {
  visibleFooter?: boolean;
}

export default function BaseModalFunc({
  className = '',
  wrapClassName = '',
  visibleFooter = true,
  type = 'confirm',
  ...props
}: BaseModalFuncProps) {
  return Modal[type]({
    width: 430,
    icon: null,
    centered: true,
    ...props,
    wrapClassName: 'portkey-ui-wrapper portkey-ui-common-modals portkey-ui-modal-func-wrapper ' + wrapClassName,
    className: clsx('portkey-ui-modal-func', visibleFooter && 'portkey-ui-modal-func-visible-footer ', className),
    prefixCls: `${PORTKEY_PREFIX_CLS}-modal`,
  });
}
