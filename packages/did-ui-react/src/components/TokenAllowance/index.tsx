import PortkeyStyleProvider from '../PortkeyStyleProvider';
import TokenAllowanceMain, { TokenAllowanceProps } from './index.components';

export default function TokenAllowance(props: TokenAllowanceProps) {
  return (
    <PortkeyStyleProvider>
      <TokenAllowanceMain {...props} />
    </PortkeyStyleProvider>
  );
}
