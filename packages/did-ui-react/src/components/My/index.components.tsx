import clsx from 'clsx';
import { PortkeySendProvider } from '../context/PortkeySendProvider';
import { useMemo } from 'react';
import './index.less';
import BackHeaderForPage from '../BackHeaderForPage';
import { IMenuItemType } from '../../types';
import MenuItem from '../MenuItem';
import CustomSvg from '../CustomSvg';

export interface MyProps {
  className?: string;
  wrapperStyle?: React.CSSProperties;
  onClose?: () => void;
  onClickGuardians: () => void;
  onClickWalletSecurity: () => void;
}

function MyContent({ className, wrapperStyle, onClose, onClickGuardians, onClickWalletSecurity }: MyProps) {
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
      <BackHeaderForPage title={`My`} leftCallBack={onClose} />
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

export default function MyMain(props: MyProps) {
  return (
    <PortkeySendProvider>
      <MyContent {...props} />
    </PortkeySendProvider>
  );
}
