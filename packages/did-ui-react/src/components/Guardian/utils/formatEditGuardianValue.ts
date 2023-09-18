import { AccountType, AccountTypeEnum, GuardiansApproved } from '@portkey/services';
import { UserGuardianStatus } from '../../../types';
import { GuardianItem } from './type';
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
  const guardianToUpdatePre: GuardianItem = {
    identifierHash: preGuardian?.identifierHash,
    type: AccountTypeEnum[currentGuardian?.guardianType as AccountType],
    verificationInfo: {
      id: preGuardian?.verifier?.id as string,
    },
  };
  const guardianToUpdateNew: GuardianItem = {
    identifierHash: currentGuardian?.identifierHash,
    type: AccountTypeEnum[currentGuardian?.guardianType as AccountType],
    verificationInfo: {
      id: currentGuardian?.verifier?.id as string,
    },
  };
  const guardiansApproved: GuardianItem[] = formatGuardianValue(approvalInfo);
  return { guardianToUpdatePre, guardianToUpdateNew, guardiansApproved };
};
