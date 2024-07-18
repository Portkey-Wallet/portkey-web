import PortkeyStyleProvider from '../PortkeyStyleProvider';
import TokenAllowanceMain, { ITokenAllowanceProps } from './index.components';

export default function TokenAllowance(props: ITokenAllowanceProps) {
  return (
    <PortkeyStyleProvider>
      <TokenAllowanceMain {...props} />
    </PortkeyStyleProvider>
  );
}
