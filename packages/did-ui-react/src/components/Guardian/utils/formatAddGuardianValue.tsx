import { AccountType, AccountTypeEnum, GuardiansApproved } from '@portkey/services';
import { GuardianApprovedItem, UserGuardianStatus } from '../../../types';
import { formatGuardianValue } from './formatGuardianValue';
import { zkGuardianType } from '../../../constants/guardian';
import { handleZKLoginInfo } from '../../../utils/guardian';

export const formatAddGuardianValue = ({
  approvalInfo,
  currentGuardian,
}: {
  approvalInfo?: GuardiansApproved[];
  currentGuardian?: UserGuardianStatus;
}) => {
  const guardianToAdd: GuardianApprovedItem = zkGuardianType.includes(currentGuardian?.guardianType as AccountType)
    ? {
        type: AccountTypeEnum[currentGuardian?.guardianType as AccountType],
        identifierHash: currentGuardian?.identifierHash,
        verificationInfo: {
          id: currentGuardian?.verifier?.id || '',
        },
        zkLoginInfo: handleZKLoginInfo(currentGuardian?.zkLoginInfo),
      }
    : {
        type: AccountTypeEnum[currentGuardian?.guardianType as AccountType],
        identifierHash: currentGuardian?.identifierHash,
        verificationInfo: {
          id: currentGuardian?.verifier?.id || '',
          signature: Object.values(Buffer.from(currentGuardian?.signature as any, 'hex')),
          verificationDoc: currentGuardian?.verificationDoc || '',
        },
      };
  const guardiansApproved: GuardianApprovedItem[] = formatGuardianValue(approvalInfo);
  return { guardianToAdd, guardiansApproved };
};
