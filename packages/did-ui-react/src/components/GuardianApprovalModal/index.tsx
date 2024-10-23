import { ChainId } from '@portkey/types';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import GuardianApprovalModalCom from './index.component';
import { GuardiansApproved, OperationTypeEnum } from '@portkey/services';
import { TStringJSON } from '@portkey/types';
import { GuardianApprovedItem, NetworkType, UserGuardianStatus } from '../../types';
import { VerifySocialLoginParams } from '../../hooks/authenticationAsync';

export interface GuardianApprovalModalProps {
  className?: string;
  open: boolean;
  caHash: string;
  originChainId: ChainId;
  targetChainId: ChainId;
  guardianList?: UserGuardianStatus[];
  networkType: NetworkType;
  operationType: OperationTypeEnum;
  operationDetails?: TStringJSON;
  officialWebsiteShow?: {
    amount?: string;
    symbol?: string;
  };
  isAsyncVerify?: boolean;
  isErrorTip?: boolean;
  sandboxId?: string;
  toAddress?: string;
  onClose: () => void;
  onBack: () => void;
  onApprovalSuccess: (
    approveList: (GuardianApprovedItem | (GuardiansApproved & { asyncVerifyInfoParams?: VerifySocialLoginParams }))[],
  ) => void | Promise<void>;
  onApprovalError?: () => void;
  onGuardianListChange?: (guardianList: UserGuardianStatus[]) => void;
}

export default function GuardianApprovalModal(props: GuardianApprovalModalProps) {
  return (
    <PortkeyStyleProvider>
      <GuardianApprovalModalCom {...props} />
    </PortkeyStyleProvider>
  );
}
