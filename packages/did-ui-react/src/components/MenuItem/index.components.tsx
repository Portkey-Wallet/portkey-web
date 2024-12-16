import clsx from 'clsx';
import { ReactNode } from 'react';
import CustomSvg from '../CustomSvg';
import './index.less';

export interface IMenuItemProps {
  icon?: ReactNode;
  children?: ReactNode;
  onClick?: (v?: any) => void;
  showEnterIcon?: boolean;
  className?: string;
  iconClassName?: string;
}

export default function MenuItemMain({
  icon,
  children,
  onClick,
  className,
  iconClassName,
  showEnterIcon = true,
}: IMenuItemProps) {
  return (
    <div className={clsx('portkey-ui-menu-item', className)} onClick={onClick}>
      {icon && <div className={clsx('portkey-ui-icon-area', iconClassName)}>{icon}</div>}
      <span className="portkey-ui-menu-item-title">{children}</span>
      {showEnterIcon && (
        <CustomSvg className="portkey-ui-enter-btn" type="ChevronRight" style={{ width: 16, height: 16 }} />
      )}
    </div>
  );
}
