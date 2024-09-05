import { AccountType, AccountTypeEnum, GuardiansApproved } from '@portkey/services';
import { GuardianApprovedItem } from '../../../types';
import { isEOAWalletGuardian, zkGuardianType } from '../../../constants/guardian';
import { handleEOAWalletRequestInfo, handleZKLoginInfo } from '../../../utils/guardian';

export const formatGuardianValue = (approvalInfo?: GuardiansApproved[]) => {
  const guardiansApproved: GuardianApprovedItem[] =
    approvalInfo?.map((item) => {
      if (zkGuardianType.includes(item.type as AccountType)) {
        // zkLogin type
        return {
          type: AccountTypeEnum[item.type as AccountType],
          identifierHash: item?.zkLoginInfo?.identifierHash || item?.identifierHash,
          verificationInfo: {
            id: item.verifierId,
          },
          zkLoginInfo: handleZKLoginInfo(item?.zkLoginInfo),
        };
      } else if (isEOAWalletGuardian(item.type as AccountType)) {
        // EOAWallet type
        return {
          type: AccountTypeEnum[item.type as AccountType],
          identifierHash: item?.identifierHash,
          verificationExt: handleEOAWalletRequestInfo(item?.verificationRequestInfo),
        };
      } else {
        // normal type
        return {
          type: AccountTypeEnum[item.type as AccountType],
          identifierHash: item?.identifierHash,
          verificationInfo: {
            id: item.verifierId,
            signature: Object.values(Buffer.from(item?.signature as any, 'hex')) as any,
            verificationDoc: item.verificationDoc,
          },
        };
      }
    }) || [];
  return guardiansApproved;
};
