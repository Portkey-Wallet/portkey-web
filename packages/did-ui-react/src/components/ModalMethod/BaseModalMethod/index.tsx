import clsx from 'clsx';
import { Modal } from '../../CustomAnt';
import { PORTKEY_MODAL_PREFIX_CLS, type PortkeyModalProps } from '../../PortkeyModal';
import { devices } from '@portkey/utils';
import confirm from '../../CustomAnt/antd/drawer/confirm';
import { ReactNode } from 'react';
import './index.less';

export interface BaseModalFuncProps extends Omit<PortkeyModalProps, 'onClose' | 'type' | 'rootClassName'> {
  visibleFooter?: boolean;
  antType?: 'info' | 'success' | 'error' | 'warn' | 'warning' | 'confirm';
  content?: ReactNode;
  onCancel?: () => void;
}

export default function BaseModalFunc({
  antType = 'confirm',
  placement = 'bottom',
  visibleFooter = true,
  wrapClassName,
  className,
  height,
  onCancel,
  ...props
}: BaseModalFuncProps) {
  const isWide = window.matchMedia('(max-width: 768px)').matches;
  const isMobile = isWide || devices.isMobileDevices();
  const isModal = !isMobile;
  const defaultHeight = height ? height : isModal ? height : '80vh';

  const mergeRootClassName = `${PORTKEY_MODAL_PREFIX_CLS}-root portkey-ui-wrapper portkey-ui-common-modals portkey-ui-modal-func-wrapper`;
  const mergeClassName = clsx(
    'portkey-ui-modal-func',
    visibleFooter && 'portkey-ui-modal-func-visible-footer',
    className,
  );

  const mergeProps = {
    width: 430,
    icon: null,
    centered: true,
    closeIcon: null,
    push: false,
    ...props,
    children: props.children || props.content,
    height: defaultHeight,
    placement,
    rootClassName: clsx(mergeRootClassName, `${PORTKEY_MODAL_PREFIX_CLS}-drawer`, wrapClassName),
    wrapClassName: mergeClassName,
    onClose: onCancel,
  };

  if (isMobile) {
    const ele = confirm({
      ...mergeProps,
      onClose: () => {
        if (props.maskClosable === undefined || props.maskClosable) {
          ele.destroy();
        }
        onCancel?.();
      },
    });
    return ele;
  }

  return Modal[antType]({
    ...mergeProps,
    onCancel,
    wrapClassName: clsx(mergeRootClassName, `${PORTKEY_MODAL_PREFIX_CLS}-modal`, wrapClassName),
    className: mergeClassName,
  });
}
