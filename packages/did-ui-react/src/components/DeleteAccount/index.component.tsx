import DeleteAccountMain from './index.component';
import PortkeyStyleProvider from '../PortkeyStyleProvider';

export interface DeleteAccountProps {
  className?: string;
  onBack?: () => void;
  onCloseAccountCancellationModal?: () => void;
}

export default function DeleteAccount(props: DeleteAccountProps) {
  return (
    <PortkeyStyleProvider>
      <DeleteAccountMain {...props} />
    </PortkeyStyleProvider>
  );
}
