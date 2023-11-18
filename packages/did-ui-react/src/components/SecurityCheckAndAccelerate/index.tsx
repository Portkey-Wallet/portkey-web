import PortkeyStyleProvider from '../PortkeyStyleProvider';
import SecurityCheckAndAccelerateMain, { SecurityCheckAndAccelerateProps } from './index.component';

export default function SecurityCheckAndAccelerate(props: SecurityCheckAndAccelerateProps) {
  return (
    <PortkeyStyleProvider>
      <SecurityCheckAndAccelerateMain {...props} />
    </PortkeyStyleProvider>
  );
}
