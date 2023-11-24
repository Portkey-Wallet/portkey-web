import PortkeyStyleProvider from '../PortkeyStyleProvider';
import GuardianListCom, { GuardianListProps } from './index.component';

export default function GuardianList(props: GuardianListProps) {
  return (
    <PortkeyStyleProvider>
      <GuardianListCom {...props} />
    </PortkeyStyleProvider>
  );
}
