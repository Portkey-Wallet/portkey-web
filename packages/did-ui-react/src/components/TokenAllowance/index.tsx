import PortkeyStyleProvider from '../PortkeyStyleProvider';
import { PortkeyProvider } from '../config-provider';
import TokenAllowanceMain, { TokenAllowanceProps } from './index.components';

export default function TokenAllowance(props: TokenAllowanceProps) {
  return (
    <PortkeyStyleProvider>
      <PortkeyProvider networkType={'MAINNET'}>
        <TokenAllowanceMain {...props} />
      </PortkeyProvider>
    </PortkeyStyleProvider>
  );
}
