import PortkeyStyleProvider from '../PortkeyStyleProvider';
import GuardianAddCom, { GuardianAddProps } from './index.component';

export default function GuardianAdd(props: GuardianAddProps) {
  return (
    <PortkeyStyleProvider>
      <GuardianAddCom {...props} />
    </PortkeyStyleProvider>
  );
}
