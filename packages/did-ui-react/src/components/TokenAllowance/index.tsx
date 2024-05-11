import PortkeyStyleProvider from '../PortkeyStyleProvider';
import { PortkeyProvider } from '../config-provider';
import TokenAllowanceMain, { ITokenAllowanceProps } from './index.components';

export default function TokenAllowance(props: ITokenAllowanceProps) {
  return (
    <PortkeyStyleProvider>
      <PortkeyProvider networkType={'MAINNET'}>
        <TokenAllowanceMain {...props} />
      </PortkeyProvider>
    </PortkeyStyleProvider>
  );
}
