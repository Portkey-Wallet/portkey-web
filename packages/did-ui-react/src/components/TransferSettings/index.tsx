import PortkeyStyleProvider from '../PortkeyStyleProvider';
import TransferSettingsMain, { TransferSettingsProps } from './index.components';

export default function TransferSettings(props: TransferSettingsProps) {
  return (
    <PortkeyStyleProvider>
      <TransferSettingsMain {...props} />
    </PortkeyStyleProvider>
  );
}
