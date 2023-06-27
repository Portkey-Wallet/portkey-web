import BaseStyleProvider from '../BaseStyleProvider';
import GuardianApprovalCom, { GuardianApprovalProps } from './index.component';

export default function GuardianApproval(props: GuardianApprovalProps) {
  return (
    <BaseStyleProvider>
      <GuardianApprovalCom {...props} />
    </BaseStyleProvider>
  );
}
