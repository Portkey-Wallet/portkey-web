import clsx from 'clsx';
import { useMemo } from 'react';
import './index.less';
import BackHeaderForPage from '../BackHeaderForPage';
import { IMenuItemType } from '../../types';
import MenuItem from '../MenuItem';
import CustomSvg from '../CustomSvg';

export interface MyProps {
  className?: string;
  wrapperStyle?: React.CSSProperties;
  onBack?: () => void;
  onClickGuardians: () => void;
  onClickWalletSecurity: () => void;
}

export default function MyMain({ className, wrapperStyle, onBack, onClickGuardians, onClickWalletSecurity }: MyProps) {
  const MenuList: IMenuItemType[] = useMemo(
    () => [
      {
        label: 'Guardians',
        icon: 'Guardians',
        onClick: onClickGuardians,
      },
      {
        label: 'Wallet Security',
        icon: 'WalletSecurity',
        onClick: onClickWalletSecurity,
      },
    ],
    [onClickGuardians, onClickWalletSecurity],
  );

  return (
    <div style={wrapperStyle} className={clsx('portkey-ui-my-wrapper', className)}>
      <BackHeaderForPage title={`My`} leftCallBack={onBack} />
      <div>
        {MenuList.map((item) => (
          <MenuItem
            key={item.label}
            icon={<CustomSvg type={item.icon || 'Aelf'} style={{ width: 20, height: 20 }} />}
            onClick={item?.onClick}>
            {item.label}
          </MenuItem>
        ))}
      </div>
    </div>
  );
}
