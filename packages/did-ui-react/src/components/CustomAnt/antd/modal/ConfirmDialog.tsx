import classNames from 'classnames';
import ConfigProvider from '../../config-provider';
import ActionButtonEle from 'antd/lib/_util/ActionButton';
import type { ModalFuncProps } from 'antd';
import Dialog from './Modal';
import { PORTKEY_ICON_PREFIX_CLS, PORTKEY_PREFIX_CLS, PORTKEY_Z_INDEX } from '../../../../constants';
import { getTransitionName } from 'antd/lib/_util/motion';

const ActionButton = (ActionButtonEle as any).default || ActionButtonEle;
interface ConfirmDialogProps extends Omit<ModalFuncProps, 'visible'> {
  afterClose?: () => void;
  close: (...args: any[]) => void;
  autoFocusButton?: null | 'ok' | 'cancel';
  rootPrefixCls: string;
  iconPrefixCls?: string;
}

const ConfirmDialog = (props: ConfirmDialogProps) => {
  const {
    icon,
    onCancel,
    onOk,
    close,
    zIndex,
    afterClose,
    open,
    keyboard,
    centered,
    getContainer,
    maskStyle,
    okText,
    okButtonProps,
    cancelText,
    cancelButtonProps,
    direction,
    prefixCls,
    wrapClassName,
    rootPrefixCls,
    bodyStyle,
    closable = false,
    closeIcon,
    modalRender,
    focusTriggerAfterClose,
  } = props;

  const okType = props.okType || 'primary';
  const contentPrefixCls = `${prefixCls}-confirm`;

  const okCancel = 'okCancel' in props ? props.okCancel! : true;
  const width = props.width || 416;
  const style = props.style || {};
  const mask = props.mask === undefined ? true : props.mask;

  const maskClosable = props.maskClosable === undefined ? false : props.maskClosable;
  const autoFocusButton = props.autoFocusButton === null ? false : props.autoFocusButton || 'ok';

  const classString = classNames(
    contentPrefixCls,
    `${contentPrefixCls}-${props.type}`,
    { [`${contentPrefixCls}-rtl`]: direction === 'rtl' },
    props.className,
  );

  const cancelButton = okCancel && (
    <ActionButton
      actionFn={onCancel}
      close={close}
      autoFocus={autoFocusButton === 'cancel'}
      buttonProps={cancelButtonProps}
      prefixCls={`${rootPrefixCls}-btn`}>
      {cancelText}
    </ActionButton>
  );

  return (
    <ConfigProvider prefixCls={PORTKEY_PREFIX_CLS} iconPrefixCls={PORTKEY_ICON_PREFIX_CLS} direction={direction}>
      <Dialog
        prefixCls={prefixCls}
        className={classString}
        wrapClassName={classNames({ [`${contentPrefixCls}-centered`]: !!props.centered }, wrapClassName)}
        onCancel={() => close?.({ triggerCancel: true })}
        open={open}
        title=""
        footer=""
        transitionName={getTransitionName(rootPrefixCls, 'zoom', props.transitionName)}
        maskTransitionName={getTransitionName(rootPrefixCls, 'fade', props.maskTransitionName)}
        mask={mask}
        maskClosable={maskClosable}
        maskStyle={maskStyle}
        style={style}
        bodyStyle={bodyStyle}
        width={width}
        zIndex={zIndex || PORTKEY_Z_INDEX}
        afterClose={afterClose}
        keyboard={keyboard}
        centered={centered}
        getContainer={getContainer}
        closable={closable}
        closeIcon={closeIcon}
        modalRender={modalRender}
        focusTriggerAfterClose={focusTriggerAfterClose}>
        <div className={`${contentPrefixCls}-body-wrapper`}>
          <div className={`${contentPrefixCls}-body`}>
            {icon}
            {props.title === undefined ? null : <span className={`${contentPrefixCls}-title`}>{props.title}</span>}
            <div className={`${contentPrefixCls}-content`}>{props.content}</div>
          </div>
          <div className={`${contentPrefixCls}-btns`}>
            {cancelButton}
            <ActionButton
              type={okType}
              actionFn={onOk}
              close={close}
              autoFocus={autoFocusButton === 'ok'}
              buttonProps={okButtonProps}
              prefixCls={`${rootPrefixCls}-btn`}>
              {okText}
            </ActionButton>
          </div>
        </div>
      </Dialog>
    </ConfigProvider>
  );
};

export default ConfirmDialog;
