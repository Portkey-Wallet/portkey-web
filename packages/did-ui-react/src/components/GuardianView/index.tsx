import PortkeyStyleProvider from '../PortkeyStyleProvider';
import GuardianAddCom, { GuardianViewProps } from './index.component';

export default function GuardianEdit(props: GuardianViewProps) {
  return (
    <PortkeyStyleProvider>
      <GuardianAddCom {...props} />
    </PortkeyStyleProvider>
  );
}
