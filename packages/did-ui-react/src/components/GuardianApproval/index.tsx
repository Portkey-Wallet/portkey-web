import PortkeyStyleProvider from '../PortkeyStyleProvider';
import GuardianApprovalCom, { GuardianApprovalProps } from './index.component';

export default function GuardianApproval(props: GuardianApprovalProps) {
  return (
    <PortkeyStyleProvider>
      <GuardianApprovalCom {...props} />
    </PortkeyStyleProvider>
  );
}
