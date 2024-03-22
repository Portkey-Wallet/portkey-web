import DeleteAccountMain, { DeleteAccountProps } from './index.component';
import PortkeyStyleProvider from '../PortkeyStyleProvider';

export default function DeleteAccount(props: DeleteAccountProps) {
  return (
    <PortkeyStyleProvider>
      <DeleteAccountMain {...props} />
    </PortkeyStyleProvider>
  );
}
