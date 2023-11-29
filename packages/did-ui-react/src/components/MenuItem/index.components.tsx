import clsx from 'clsx';
import { ReactNode } from 'react';
import CustomSvg from '../CustomSvg';
import './index.less';

export interface IMenuItemProps {
  icon?: ReactNode;
  children?: ReactNode;
  onClick?: (v?: any) => void;
  height?: number;
  showEnterIcon?: boolean;
  className?: string;
}

export default function MenuItemMain({
  icon,
  children,
  onClick,
  className,
  height = 56,
  showEnterIcon = true,
}: IMenuItemProps) {
  return (
    <div className={clsx('portkey-ui-menu-item', className)} style={{ height }} onClick={onClick}>
      {icon && <div className="portkey-ui-icon-area">{icon}</div>}
      <span className="portkey-ui-menu-item-title">{children}</span>
      {showEnterIcon && (
        <CustomSvg className="portkey-ui-enter-btn" type="LeftArrow" style={{ width: 16, height: 16 }} />
      )}
    </div>
  );
}
