import PortkeyStyleProvider from '../PortkeyStyleProvider';
import ReceiveListMain, { IReceiveListProps } from './index.components';

export default function ReceiveList(props: IReceiveListProps) {
  return (
    <PortkeyStyleProvider>
      <ReceiveListMain {...props} />
    </PortkeyStyleProvider>
  );
}
