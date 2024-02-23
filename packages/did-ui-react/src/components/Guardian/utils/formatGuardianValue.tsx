import { AccountType, AccountTypeEnum, GuardiansApproved } from '@portkey/services';
import { GuardianApprovedItem } from './type';

export const formatGuardianValue = (approvalInfo?: GuardiansApproved[]) => {
  const guardiansApproved: GuardianApprovedItem[] =
    approvalInfo?.map((item) => ({
      type: AccountTypeEnum[item.type as AccountType],
      identifierHash: item?.identifierHash,
      verificationInfo: {
        id: item.verifierId,
        signature: Object.values(Buffer.from(item?.signature as any, 'hex')) as any,
        verificationDoc: item.verificationDoc,
      },
    })) || [];
  return guardiansApproved;
};
