import { AccountType, AccountTypeEnum, GuardiansApproved } from '@portkey/services';
import { UserGuardianStatus } from '../../../types';
import { GuardianApprovedItem } from './type';
import { formatGuardianValue } from './formatGuardianValue';

export const formatEditGuardianValue = ({
  approvalInfo,
  currentGuardian,
  preGuardian,
}: {
  approvalInfo?: GuardiansApproved[];
  currentGuardian?: UserGuardianStatus;
  preGuardian?: UserGuardianStatus;
}) => {
  const guardianToUpdatePre: GuardianApprovedItem = {
    identifierHash: preGuardian?.identifierHash,
    type: AccountTypeEnum[currentGuardian?.guardianType as AccountType],
    verificationInfo: {
      id: preGuardian?.verifier?.id as string,
    },
  };
  const guardianToUpdateNew: GuardianApprovedItem = {
    identifierHash: currentGuardian?.identifierHash,
    type: AccountTypeEnum[currentGuardian?.guardianType as AccountType],
    verificationInfo: {
      id: currentGuardian?.verifier?.id as string,
    },
  };
  const guardiansApproved: GuardianApprovedItem[] = formatGuardianValue(approvalInfo);
  return { guardianToUpdatePre, guardianToUpdateNew, guardiansApproved };
};
