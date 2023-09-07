import clsx from 'clsx';
import { PortkeySendProvider } from '../context/PortkeySendProvider';
import { useMemo } from 'react';
import './index.less';
import BackHeaderForPage from '../BackHeaderForPage';
import { IMenuItemType } from '../../types';
import MenuItem from '../MenuItem';

export interface IWalletSecurityProps {
  className?: string;
  wrapperStyle?: React.CSSProperties;
  onClose?: () => void;
  onClickPaymentSecurity: () => void;
}

function WalletSecurityContent({ className, wrapperStyle, onClose, onClickPaymentSecurity }: IWalletSecurityProps) {
  const MenuList: IMenuItemType[] = useMemo(
    () => [
      {
        label: 'Payment Security',
        onClick: onClickPaymentSecurity,
      },
    ],
    [onClickPaymentSecurity],
  );

  return (
    <div style={wrapperStyle} className={clsx('portkey-ui-wallet-security-wrapper', className)}>
      <BackHeaderForPage title={`Wallet Security`} leftCallBack={onClose} />
      <div>
        {MenuList.map((item) => (
          <MenuItem key={item.label} onClick={item?.onClick}>
            {item.label}
          </MenuItem>
        ))}
      </div>
    </div>
  );
}

export default function WalletSecurityMain(props: IWalletSecurityProps) {
  return (
    <PortkeySendProvider>
      <WalletSecurityContent {...props} />
    </PortkeySendProvider>
  );
}
