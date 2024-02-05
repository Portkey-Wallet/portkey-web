import { devices } from '@portkey/utils';
import { useCallback, useMemo } from 'react';
import { useMedia } from 'react-use';
import { Drawer, Modal } from '../CustomAnt';
import type { DrawerProps, ModalProps } from 'antd';

import { getConfirmLocale } from 'antd/lib/modal/locale';
import LocaleReceiver from 'antd/lib/locale-provider/LocaleReceiver';
import clsx from 'clsx';
import { convertLegacyProps } from 'antd/lib/button/button';
import './index.less';
import ThrottleButton from '../ThrottleButton';

export type PortkeyDrawerInModalProps = Omit<
  DrawerProps,
  'drawerStyle' | 'headerStyle' | 'footerStyle' | 'rootStyle' | 'contentWrapperStyle'
>;
export type PortkeyBaseModalProps = Omit<
  ModalProps,
  'afterClose' | 'modalRender' | 'maskTransitionName' | 'wrapProps' | 'mousePosition' | 'onCancel'
>;
type BaseAntdModalProps = PortkeyDrawerInModalProps & PortkeyBaseModalProps;

export const PORTKEY_MODAL_PREFIX_CLS = 'portkey-ui-modal_drawer';

export interface PortkeyModalProps extends BaseAntdModalProps {
  type?: 'modal' | 'drawer' | 'auto';
  onClose?: () => void;
}
/**
 *
 * @param centered - Only use modal
 * @param transitionName - Only use modal
 * @param focusTriggerAfterClose - Only use modal
 * @param maskClassName - When its type is modal, maskClassName is maskTransitionName,
 * @param push - Only use Drawer
 * @param autoFocus - Only use Drawer
 * @param motion - Only use Drawer
 * @param maskMotion - Only use Drawer
 * @param size - Only use Drawer
 * @param extra - Only use Drawer
 * @returns Modal or Drawer
 */
export default function PortkeyModal({
  type = 'auto',
  // modal props
  centered,
  transitionName,
  focusTriggerAfterClose,
  // mousePosition,

  // drawer props
  push = false,
  autoFocus,
  placement,
  motion,
  maskMotion,
  size,
  extra,
  // drawer props -> modal
  afterOpenChange,
  onClose,
  height,
  // height, rootClassName

  // modal props -> drawer
  okText,
  okType = 'primary',
  confirmLoading = false,
  cancelText,
  okButtonProps,
  cancelButtonProps,
  wrapClassName,
  // modal maskTransitionName  rename maskClassName
  maskClassName,
  onOk,

  // modal and drawer  common props
  open,
  rootClassName,
  footer,
  ...props
}: PortkeyModalProps) {
  const isWide = useMedia('(max-width: 768px)');
  const isMobile = useMemo(() => isWide || devices.isMobileDevices(), [isWide]);

  const defaultFooter = useCallback(
    () => (
      <LocaleReceiver componentName="Modal" defaultLocale={getConfirmLocale()}>
        {(contextLocale) => {
          return (
            <>
              <ThrottleButton onClick={onClose} {...cancelButtonProps}>
                {cancelText || contextLocale.cancelText}
              </ThrottleButton>
              <ThrottleButton
                {...convertLegacyProps(okType)}
                loading={confirmLoading}
                onClick={onOk}
                {...okButtonProps}>
                {okText ?? contextLocale.okText}
              </ThrottleButton>
            </>
          );
        }}
      </LocaleReceiver>
    ),
    [cancelButtonProps, cancelText, confirmLoading, okButtonProps, okText, okType, onClose, onOk],
  );

  const defaultHeight = useMemo(() => {
    if (type === 'modal') return height;
    if (!height && (type === 'drawer' || isMobile)) return '80vh';
    return height;
  }, [height, isMobile, type]);

  const ModalComponent = useMemo(() => {
    if (open) afterOpenChange?.(true);
    return (
      <Modal
        {...props}
        open={open}
        centered={centered}
        rootClassName={clsx(`${PORTKEY_MODAL_PREFIX_CLS}-root`, rootClassName)}
        afterClose={() => afterOpenChange?.(false)}
        okText={okText}
        onOk={onOk}
        onCancel={onClose}
        okType={okType}
        confirmLoading={confirmLoading}
        cancelText={cancelText}
        okButtonProps={okButtonProps}
        cancelButtonProps={cancelButtonProps}
        wrapClassName={wrapClassName}
        maskTransitionName={maskClassName}
        transitionName={transitionName}
        focusTriggerAfterClose={focusTriggerAfterClose}
        // mousePosition={mousePosition}
        footer={footer === undefined ? defaultFooter() : footer}
        height={defaultHeight}
      />
    );
  }, [
    afterOpenChange,
    cancelButtonProps,
    cancelText,
    centered,
    confirmLoading,
    defaultFooter,
    focusTriggerAfterClose,
    footer,
    defaultHeight,
    maskClassName,
    okButtonProps,
    okText,
    okType,
    onClose,
    onOk,
    open,
    props,
    rootClassName,
    transitionName,
    wrapClassName,
  ]);
  const DrawerComponent = useMemo(
    () => (
      <Drawer
        {...props}
        open={open}
        push={push}
        autoFocus={autoFocus}
        rootClassName={clsx(`${PORTKEY_MODAL_PREFIX_CLS}-root`, rootClassName)}
        placement={placement}
        maskClassName={maskClassName}
        motion={motion}
        maskMotion={maskMotion}
        wrapClassName={wrapClassName}
        size={size}
        footer={footer === undefined ? defaultFooter() : footer}
        extra={extra}
        onClose={onClose}
        height={defaultHeight}
      />
    ),
    [
      autoFocus,
      defaultFooter,
      extra,
      footer,
      defaultHeight,
      maskClassName,
      maskMotion,
      motion,
      onClose,
      open,
      placement,
      props,
      push,
      rootClassName,
      size,
      wrapClassName,
    ],
  );

  const renderDom = useMemo(() => {
    if (type === 'modal') return ModalComponent;
    if (type === 'drawer') return DrawerComponent;
    if (isMobile) return DrawerComponent;
    return ModalComponent;
  }, [DrawerComponent, ModalComponent, isMobile, type]);

  return <div>{renderDom}</div>;
}
