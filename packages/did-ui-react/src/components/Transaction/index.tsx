import PortkeyStyleProvider from '../PortkeyStyleProvider';
import TransactionMain, { TransactionProps } from './index.component';

export default function Transaction(props: TransactionProps) {
  return (
    <PortkeyStyleProvider>
      <TransactionMain {...props} />
    </PortkeyStyleProvider>
  );
}
