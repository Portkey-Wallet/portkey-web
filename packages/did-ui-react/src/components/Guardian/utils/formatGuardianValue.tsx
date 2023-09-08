import { AccountType, GuardiansApproved } from '@portkey/services';
import { GuardianItem } from './type';

export const formatGuardianValue = (approvalInfo?: GuardiansApproved[]) => {
  const guardiansApproved: GuardianItem[] =
    approvalInfo?.map((item) => ({
      type: item.type as AccountType,
      identifierHash: item?.identifierHash,
      verificationInfo: {
        id: item.verifierId,
        signature: Object.values(Buffer.from(item?.signature as any, 'hex')) as any,
        verificationDoc: item.verificationDoc,
      },
    })) || [];
  return guardiansApproved;
};
