import PortkeyStyleProvider from '../PortkeyStyleProvider';
import GuardianAddCom, { GuardianEditProps } from './index.component';

export default function GuardianAdd(props: GuardianEditProps) {
  return (
    <PortkeyStyleProvider>
      <GuardianAddCom {...props} />
    </PortkeyStyleProvider>
  );
}
