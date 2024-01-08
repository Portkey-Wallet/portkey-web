import { ChainId } from '@portkey/types';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import GuardianApprovalModalCom from './index.component';
import { OperationTypeEnum } from '@portkey/services';
import { GuardianApprovedItem } from '../Guardian/utils/type';

export interface GuardianApprovalModalProps {
  className?: string;
  open: boolean;
  caHash: string;
  originChainId: ChainId;
  targetChainId: ChainId;
  networkType: string;
  operationType: OperationTypeEnum;
  isErrorTip?: boolean;
  sandboxId?: string;
  onClose: () => void;
  onBack: () => void;
  onApprovalSuccess: (approveList: GuardianApprovedItem[]) => void | Promise<void>;
  onApprovalError?: () => void;
}

export default function GuardianApprovalModal(props: GuardianApprovalModalProps) {
  return (
    <PortkeyStyleProvider>
      <GuardianApprovalModalCom {...props} />
    </PortkeyStyleProvider>
  );
}
