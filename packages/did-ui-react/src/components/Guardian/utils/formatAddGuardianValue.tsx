import { AccountType, AccountTypeEnum, GuardiansApproved } from '@portkey/services';
import { UserGuardianStatus } from '../../../types';
import { GuardianApprovedItem } from './type';
import { formatGuardianValue } from './formatGuardianValue';

export const formatAddGuardianValue = ({
  approvalInfo,
  currentGuardian,
}: {
  approvalInfo?: GuardiansApproved[];
  currentGuardian?: UserGuardianStatus;
}) => {
  const guardianToAdd: GuardianApprovedItem = {
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
