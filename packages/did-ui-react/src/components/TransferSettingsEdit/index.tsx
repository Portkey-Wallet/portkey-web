import PortkeyStyleProvider from '../PortkeyStyleProvider';
import TransferSettingsEditMain, { ITransferSettingsEditProps } from './index.components';

export default function TransferSettingsEdit(props: ITransferSettingsEditProps) {
  return (
    <PortkeyStyleProvider>
      <TransferSettingsEditMain {...props} />
    </PortkeyStyleProvider>
  );
}
