import PortkeyStyleProvider from '../PortkeyStyleProvider';
import SendMain, { SendProps } from './index.components';

export default function Send(props: SendProps) {
  return (
    <PortkeyStyleProvider>
      <SendMain {...props} />
    </PortkeyStyleProvider>
  );
}
