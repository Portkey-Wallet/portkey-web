import CloseOutlinedIcon from '@ant-design/icons/CloseOutlined';
import classNames from 'classnames';
import RcDrawer from 'rc-drawer';
import type { DrawerProps as RcDrawerProps } from 'rc-drawer';
import type { CSSMotionProps } from 'rc-motion';
import * as React from 'react';
import { NoFormStyle } from 'antd/lib/form/context';
import { NoCompactStyle } from 'antd/lib/space/Compact';
import { getTransitionName } from 'antd/lib/_util/motion';
import { tuple } from 'antd/lib/_util/type';
import { ConfigContext } from '../../config-provider';
import clsx from 'clsx';
const CloseOutlined = (CloseOutlinedIcon as any).default || CloseOutlinedIcon;

const SizeTypes = tuple('default', 'large');
type sizeType = (typeof SizeTypes)[number];

export interface PushState {
  distance: string | number;
}

// Drawer diff props: 'open' | 'motion' | 'maskMotion' | 'wrapperClassName'
export interface DrawerProps extends Omit<RcDrawerProps, 'visible' | 'afterVisibleChange'> {
  size?: sizeType;
  closable?: boolean;
  closeIcon?: React.ReactNode;

  /** Wrapper dom node style of header and body */
  drawerStyle?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  footerStyle?: React.CSSProperties;

  title?: React.ReactNode;

  open?: boolean;

  footer?: React.ReactNode;
  extra?: React.ReactNode;

  afterOpenChange?: (open: boolean) => void;

  /* custom props */
  wrapClassName?: string;
}

const defaultPushState: PushState = { distance: 180 };

function Drawer(props: DrawerProps) {
  const {
    width,
    height,
    size = 'default',
    closable = true,
    mask = true,
    push = defaultPushState,
    closeIcon = <CloseOutlined />,
    bodyStyle,
    drawerStyle,
    className,
    open,
    children,
    style,
    title,
    headerStyle,
    onClose,
    footer,
    footerStyle,
    prefixCls: customizePrefixCls,
    getContainer: customizeGetContainer,
    extra,
    afterOpenChange,
    wrapClassName,
    rootClassName,
    ...rest
  } = props;

  const { getPopupContainer, getPrefixCls, direction } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('drawer', customizePrefixCls);

  const getContainer =
    customizeGetContainer === undefined && getPopupContainer
      ? () => getPopupContainer(document.body)
      : customizeGetContainer;

  const closeIconNode = closable && (
    <button type="button" onClick={onClose} aria-label="Close" className={`${prefixCls}-close`}>
      {closeIcon}
    </button>
  );

  function renderHeader() {
    if (!title && !closable) {
      return null;
    }

    return (
      <div
        className={classNames(`${prefixCls}-header`, {
          [`${prefixCls}-header-close-only`]: closable && !title && !extra,
        })}
        style={headerStyle}>
        <div className={`${prefixCls}-header-title`}>
          {closeIconNode}
          {title && <div className={`${prefixCls}-title`}>{title}</div>}
        </div>
        {extra && <div className={`${prefixCls}-extra`}>{extra}</div>}
      </div>
    );
  }

  function renderFooter() {
    if (!footer) {
      return null;
    }

    const footerClassName = `${prefixCls}-footer`;
    return (
      <div className={footerClassName} style={footerStyle}>
        {footer}
      </div>
    );
  }

  const drawerClassName = classNames(
    {
      'no-mask': !mask,
      [`${prefixCls}-rtl`]: direction === 'rtl',
    },
    rootClassName,
    className,
  );

  // ============================ Size ============================
  const mergedWidth = React.useMemo(() => width ?? (size === 'large' ? 736 : 378), [width, size]);
  const mergedHeight = React.useMemo(() => height ?? (size === 'large' ? 736 : 378), [height, size]);

  // =========================== Motion ===========================
  const maskMotion: CSSMotionProps = {
    motionName: getTransitionName(prefixCls, 'mask-motion'),
    motionAppear: true,
    motionEnter: true,
    motionLeave: true,
    motionDeadline: 500,
  };

  const panelMotion: RcDrawerProps['motion'] = (motionPlacement) => ({
    motionName: getTransitionName(prefixCls, `panel-motion-${motionPlacement}`),
    motionAppear: true,
    motionEnter: true,
    motionLeave: true,
    motionDeadline: 500,
  });

  // =========================== Render ===========================
  return (
    <NoCompactStyle>
      <NoFormStyle status override>
        <RcDrawer
          prefixCls={prefixCls}
          onClose={onClose}
          {...rest}
          open={open}
          mask={mask}
          push={push}
          width={mergedWidth}
          height={mergedHeight}
          rootClassName={drawerClassName}
          getContainer={getContainer}
          afterOpenChange={(isOpen) => {
            afterOpenChange?.(isOpen);
          }}
          maskMotion={maskMotion}
          motion={panelMotion}
          rootStyle={style}>
          <div className={clsx(`${prefixCls}-wrapper-body`, wrapClassName)} style={{ ...drawerStyle }}>
            {renderHeader()}
            <div className={`${prefixCls}-body`} style={bodyStyle}>
              {children}
            </div>
            {renderFooter()}
          </div>
        </RcDrawer>
      </NoFormStyle>
    </NoCompactStyle>
  );
}

if (process.env.NODE_ENV !== 'production') {
  Drawer.displayName = 'Drawer';
}

export default Drawer;
