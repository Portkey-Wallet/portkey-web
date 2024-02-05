import CloseOutlinedIcon from '@ant-design/icons/CloseOutlined';
import classNames from 'classnames';
import Dialog from 'rc-dialog';
import * as React from 'react';
import type { ButtonProps } from 'antd';
import { NoFormStyle } from 'antd/lib/form/context';
import LocaleReceiver from '../../locale-provider/LocaleReceiver';
import { getTransitionName } from 'antd/lib/_util/motion';
import type { DirectionType } from 'antd/lib/config-provider';
import { LegacyButtonType, convertLegacyProps } from 'antd/lib/button/button';
import { NoCompactStyle } from 'antd/lib/space/Compact';
import { canUseDocElement } from 'antd/lib/_util/styleChecker';
import { getConfirmLocale } from 'antd/lib/modal/locale';
import ConfigProvider from '../../config-provider';
import { PORTKEY_Z_INDEX } from '../../../../constants';
import ThrottleButton from '../../../ThrottleButton';
type MousePosition = { x: number; y: number } | null;

let mousePosition: MousePosition;

const CloseOutlined = (CloseOutlinedIcon as any).default || CloseOutlinedIcon;

// ref: https://github.com/ant-design/ant-design/issues/15795
const getClickPosition = (e: MouseEvent) => {
  mousePosition = {
    x: e.pageX,
    y: e.pageY,
  };

  setTimeout(() => {
    mousePosition = null;
  }, 100);
};

if (canUseDocElement()) {
  document.documentElement.addEventListener('click', getClickPosition, true);
}

export interface ModalProps {
  open?: boolean;
  confirmLoading?: boolean;
  title?: React.ReactNode;
  closable?: boolean;
  onOk?: (e: React.MouseEvent<HTMLElement>) => void;
  onCancel?: (e: React.MouseEvent<HTMLElement>) => void;
  afterClose?: () => void;
  centered?: boolean;
  width?: string | number;
  footer?: React.ReactNode;
  okText?: React.ReactNode;
  okType?: LegacyButtonType;
  cancelText?: React.ReactNode;
  maskClosable?: boolean;
  forceRender?: boolean;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  destroyOnClose?: boolean;
  style?: React.CSSProperties;
  wrapClassName?: string;
  maskTransitionName?: string;
  transitionName?: string;
  className?: string;
  getContainer?: string | HTMLElement | getContainerFunc | false;
  zIndex?: number;
  bodyStyle?: React.CSSProperties;
  maskStyle?: React.CSSProperties;
  mask?: boolean;
  keyboard?: boolean;
  wrapProps?: any;
  prefixCls?: string;
  closeIcon?: React.ReactNode;
  modalRender?: (node: React.ReactNode) => React.ReactNode;
  focusTriggerAfterClose?: boolean;
  children?: React.ReactNode;
  mousePosition?: MousePosition;
  height?: number | string;
  rootClassName?: string;
}

type getContainerFunc = () => HTMLElement;

export interface ModalFuncProps {
  prefixCls?: string;
  className?: string;
  open?: boolean;
  title?: React.ReactNode;
  closable?: boolean;
  content?: React.ReactNode;
  // TODO: find out exact types
  onOk?: (...args: any[]) => any;
  onCancel?: (...args: any[]) => any;
  afterClose?: () => void;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  centered?: boolean;
  width?: string | number;
  okText?: React.ReactNode;
  okType?: LegacyButtonType;
  cancelText?: React.ReactNode;
  icon?: React.ReactNode;
  mask?: boolean;
  maskClosable?: boolean;
  zIndex?: number;
  okCancel?: boolean;
  style?: React.CSSProperties;
  wrapClassName?: string;
  maskStyle?: React.CSSProperties;
  type?: 'info' | 'success' | 'error' | 'warn' | 'warning' | 'confirm';
  keyboard?: boolean;
  getContainer?: string | HTMLElement | getContainerFunc | false;
  autoFocusButton?: null | 'ok' | 'cancel';
  transitionName?: string;
  maskTransitionName?: string;
  direction?: DirectionType;
  bodyStyle?: React.CSSProperties;
  closeIcon?: React.ReactNode;
  modalRender?: (node: React.ReactNode) => React.ReactNode;
  focusTriggerAfterClose?: boolean;
}

export interface ModalLocale {
  okText: string;
  cancelText: string;
  justOkText: string;
}

const Modal: React.FC<ModalProps> = (props) => {
  const {
    getPopupContainer: getContextPopupContainer,
    getPrefixCls,
    direction,
  } = React.useContext(ConfigProvider.ConfigContext);

  const handleCancel = (e: any) => {
    const { onCancel } = props;
    onCancel?.(e);
  };

  const handleOk = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { onOk } = props;
    onOk?.(e);
  };

  const {
    prefixCls: customizePrefixCls,
    footer,
    open = false,
    wrapClassName,
    centered,
    getContainer,
    closeIcon,
    focusTriggerAfterClose = true,
    width = 520,
    zIndex = PORTKEY_Z_INDEX,
    ...restProps
  } = props;

  const prefixCls = getPrefixCls('modal', customizePrefixCls);
  const rootPrefixCls = getPrefixCls();

  const defaultFooter = () => (
    <LocaleReceiver componentName="Modal" defaultLocale={getConfirmLocale()}>
      {(contextLocale) => {
        const { okText, okType = 'primary', cancelText, confirmLoading = false } = props;

        return (
          <>
            <ThrottleButton onClick={handleCancel} {...props.cancelButtonProps}>
              {cancelText || contextLocale.cancelText}
            </ThrottleButton>
            <ThrottleButton
              {...convertLegacyProps(okType)}
              loading={confirmLoading}
              onClick={handleOk}
              {...props.okButtonProps}>
              {okText ?? contextLocale.okText}
            </ThrottleButton>
          </>
        );
      }}
    </LocaleReceiver>
  );

  const closeIconToRender = (
    <span className={`${prefixCls}-close-x`}>
      {closeIcon || (CloseOutlined && <CloseOutlined className={`${prefixCls}-close-icon`} />)}
    </span>
  );

  const wrapClassNameExtended = classNames(wrapClassName, {
    [`${prefixCls}-centered`]: !!centered,
    [`${prefixCls}-wrap-rtl`]: direction === 'rtl',
  });

  return (
    <NoCompactStyle>
      <NoFormStyle status override>
        <Dialog
          width={width}
          {...restProps}
          getContainer={
            getContainer === undefined ? (getContextPopupContainer as getContainerFunc) || undefined : getContainer
          }
          prefixCls={prefixCls}
          wrapClassName={wrapClassNameExtended}
          footer={footer === undefined ? defaultFooter() : footer}
          visible={open}
          zIndex={zIndex}
          mousePosition={restProps.mousePosition ?? mousePosition}
          onClose={handleCancel}
          closeIcon={closeIconToRender}
          focusTriggerAfterClose={focusTriggerAfterClose}
          transitionName={getTransitionName(rootPrefixCls, 'zoom', props.transitionName)}
          maskTransitionName={getTransitionName(rootPrefixCls, 'fade', props.maskTransitionName)}
        />
      </NoFormStyle>
    </NoCompactStyle>
  );
};

export default Modal;
