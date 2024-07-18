import { ChainId } from '@portkey/types';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import GuardianApprovalModalCom from './index.component';
import { OperationTypeEnum } from '@portkey/services';
import { TStringJSON } from '@portkey/types';
import { GuardianApprovedItem, NetworkType } from '../../types';

export interface GuardianApprovalModalProps {
  className?: string;
  open: boolean;
  caHash: string;
  originChainId: ChainId;
  targetChainId: ChainId;
  networkType: NetworkType;
  operationType: OperationTypeEnum;
  operationDetails?: TStringJSON;
  officialWebsiteShow?: {
    amount?: string;
    symbol?: string;
  };
  isErrorTip?: boolean;
  sandboxId?: string;
  toAddress?: string;
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
