import clsx from 'clsx';
import './index.less';
import BackHeaderForPage from '../BackHeaderForPage';
import { IMenuItemType } from '../../types';
import MenuItem from '../MenuItem';
import CustomSvg from '../CustomSvg';
import { TitleWrapperProps } from '../TitleWrapper';

export interface MenuListProps {
  className?: string;
  wrapperStyle?: React.CSSProperties;
  isShowHeader?: boolean;
  isShowFooter?: boolean;
  headerConfig?: {
    title?: string;
    onBack?: () => void;
  } & TitleWrapperProps;
  menuList: IMenuItemType[];
  footerElement?: React.ReactNode;
}

export default function MenuListMain({
  className,
  wrapperStyle,
  isShowHeader = true,
  isShowFooter = false,
  headerConfig,
  menuList,
  footerElement,
}: MenuListProps) {
  return (
    <div style={wrapperStyle} className={clsx('portkey-ui-menu-list-wrapper', className)}>
      {isShowHeader && (
        <BackHeaderForPage title={headerConfig?.title} leftCallBack={headerConfig?.onBack} {...headerConfig} />
      )}
      <div>
        {menuList.map((item) => (
          <MenuItem
            key={item.label}
            icon={item?.icon && <CustomSvg type={item.icon} style={{ width: 20, height: 20 }} />}
            onClick={item?.onClick}>
            {item.label}
          </MenuItem>
        ))}
      </div>
      {isShowFooter && footerElement}
    </div>
  );
}
