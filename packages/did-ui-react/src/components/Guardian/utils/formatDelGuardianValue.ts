import { AccountType, AccountTypeEnum, GuardiansApproved } from '@portkey-v1/services';
import { UserGuardianStatus } from '../../../types';
import { GuardianItem } from './type';
import { formatGuardianValue } from './formatGuardianValue';

export const formatDelGuardianValue = ({
  approvalInfo,
  currentGuardian,
}: {
  approvalInfo?: GuardiansApproved[];
  currentGuardian?: UserGuardianStatus;
}) => {
  const guardianToRemove: GuardianItem = {
    type: AccountTypeEnum[currentGuardian?.guardianType as AccountType],
    identifierHash: currentGuardian?.identifierHash,
    verificationInfo: {
      id: currentGuardian?.verifier?.id as string,
    },
  };
  const guardiansApproved: GuardianItem[] = formatGuardianValue(approvalInfo);
  return { guardianToRemove, guardiansApproved };
};
