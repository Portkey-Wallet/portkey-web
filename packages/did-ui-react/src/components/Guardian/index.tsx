import GuardianMain, { GuardianProps } from './index.component';
import PortkeyStyleProvider from '../PortkeyStyleProvider';

export default function Guardian(props: GuardianProps) {
  return (
    <PortkeyStyleProvider>
      <GuardianMain {...props} />
    </PortkeyStyleProvider>
  );
}
