import PortkeyStyleProvider from '../PortkeyStyleProvider';
import SetSecondaryMailboxMain, { ISetSecondaryMailboxProps } from './index.components';

export default function SetSecondaryMailbox(props: ISetSecondaryMailboxProps) {
  return (
    <PortkeyStyleProvider>
      <SetSecondaryMailboxMain {...props} />
    </PortkeyStyleProvider>
  );
}
