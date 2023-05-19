import BaseStyleProvider from '../BaseStyleProvider';
import ScanCardCom, { ScanCardProps } from './index.component';

export default function ScanCard(props?: ScanCardProps) {
  return (
    <BaseStyleProvider>
      <ScanCardCom {...props} />
    </BaseStyleProvider>
  );
}
