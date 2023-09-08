import PortkeyStyleProvider from '../PortkeyStyleProvider';
import WalletSecurityMain, { IWalletSecurityProps } from './index.components';

export default function WalletSecurity(props: IWalletSecurityProps) {
  return (
    <PortkeyStyleProvider>
      <WalletSecurityMain {...props} />
    </PortkeyStyleProvider>
  );
}
