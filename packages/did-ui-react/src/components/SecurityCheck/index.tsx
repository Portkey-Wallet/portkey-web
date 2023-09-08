import PortkeyStyleProvider from '../PortkeyStyleProvider';
import SecurityCheckMain, { SecurityCheckProps } from './index.component';

export default function SecurityCheck(props: SecurityCheckProps) {
  return (
    <PortkeyStyleProvider>
      <SecurityCheckMain {...props} />
    </PortkeyStyleProvider>
  );
}
