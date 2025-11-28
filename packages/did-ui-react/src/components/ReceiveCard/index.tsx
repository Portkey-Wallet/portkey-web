import PortkeyStyleProvider from '../PortkeyStyleProvider';
import ReceiveCardMain, { ReceiveCardProps } from './index.components';

export default function ReceiveCard(props: ReceiveCardProps) {
  return (
    <PortkeyStyleProvider>
      <ReceiveCardMain {...props} />
    </PortkeyStyleProvider>
  );
}
