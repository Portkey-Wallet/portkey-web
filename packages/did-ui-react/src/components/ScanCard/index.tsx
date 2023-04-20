import ScanCardCom, { ScanCardProps } from './index.component';
import { BaseConfigProvider } from '../config-provider';

export default function ScanCard(props?: ScanCardProps) {
  return (
    <BaseConfigProvider>
      <ScanCardCom {...props} />
    </BaseConfigProvider>
  );
}
