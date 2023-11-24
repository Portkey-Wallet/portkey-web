import PortkeyStyleProvider from '../PortkeyStyleProvider';
import ScanCardCom, { ScanCardProps } from './index.component';

export default function ScanCard(props?: ScanCardProps) {
  return (
    <PortkeyStyleProvider>
      <ScanCardCom {...props} />
    </PortkeyStyleProvider>
  );
}
