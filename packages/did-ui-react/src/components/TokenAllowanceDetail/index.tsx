import PortkeyStyleProvider from '../PortkeyStyleProvider';
import TokenAllowanceDetailMain, { ITokenAllowanceDetailProps } from './index.components';

export default function TokenAllowanceDetail(props: ITokenAllowanceDetailProps) {
  return (
    <PortkeyStyleProvider>
      <TokenAllowanceDetailMain {...props} />
    </PortkeyStyleProvider>
  );
}
