import { AccountType, GuardiansApproved } from '@portkey/services';
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
    type: currentGuardian?.guardianType as AccountType,
    identifierHash: currentGuardian?.identifierHash,
    verificationInfo: {
      id: currentGuardian?.verifier?.id as string,
    },
  };
  const guardiansApproved: GuardianItem[] = formatGuardianValue(approvalInfo);
  return { guardianToRemove, guardiansApproved };
};
