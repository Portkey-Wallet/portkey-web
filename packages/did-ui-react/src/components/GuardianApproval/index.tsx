import GuardianApprovalCom, { GuardianApprovalProps } from './index.component';
import { BaseConfigProvider } from '../config-provider';

export default function GuardianApproval(props: GuardianApprovalProps) {
  return (
    <BaseConfigProvider>
      <GuardianApprovalCom {...props} />
    </BaseConfigProvider>
  );
}
