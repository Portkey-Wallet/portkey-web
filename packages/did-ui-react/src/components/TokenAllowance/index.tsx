import PortkeyStyleProvider from '../PortkeyStyleProvider';
import ScreenLoading from '../ScreenLoading';
import TokenAllowanceMain, { ITokenAllowanceProps } from './index.components';

export default function TokenAllowance(props: ITokenAllowanceProps) {
  return (
    <PortkeyStyleProvider>
      <TokenAllowanceMain {...props} />
      <ScreenLoading />
    </PortkeyStyleProvider>
  );
}
