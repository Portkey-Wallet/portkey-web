import { AccountType, AccountTypeEnum, GuardiansApproved } from '@portkey/services';
import { GuardianApprovedItem, UserGuardianStatus } from '../../../types';
import { formatGuardianValue } from './formatGuardianValue';

export const formatDelGuardianValue = ({
  approvalInfo,
  currentGuardian,
}: {
  approvalInfo?: GuardiansApproved[];
  currentGuardian?: UserGuardianStatus;
}) => {
  const guardianToRemove: GuardianApprovedItem = {
    type: AccountTypeEnum[currentGuardian?.guardianType as AccountType],
    identifierHash: currentGuardian?.identifierHash,
    verificationInfo: {
      id: currentGuardian?.verifier?.id as string,
    },
  };
  const guardiansApproved: GuardianApprovedItem[] = formatGuardianValue(approvalInfo);
  return { guardianToRemove, guardiansApproved };
};
