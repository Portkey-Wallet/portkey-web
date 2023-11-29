import { AccountType, AccountTypeEnum, GuardiansApproved } from '@portkey/services';
import { UserGuardianStatus } from '../../../types';
import { GuardianItem } from './type';
import { formatGuardianValue } from './formatGuardianValue';

export const formatAddGuardianValue = ({
  approvalInfo,
  currentGuardian,
}: {
  approvalInfo?: GuardiansApproved[];
  currentGuardian?: UserGuardianStatus;
}) => {
  const guardianToAdd: GuardianItem = {
    type: AccountTypeEnum[currentGuardian?.guardianType as AccountType],
    identifierHash: currentGuardian?.identifierHash,
    verificationInfo: {
      id: currentGuardian?.verifier?.id || '',
      signature: Object.values(Buffer.from(currentGuardian?.signature as any, 'hex')),
      verificationDoc: currentGuardian?.verificationDoc || '',
    },
  };
  const guardiansApproved: GuardianItem[] = formatGuardianValue(approvalInfo);
  return { guardianToAdd, guardiansApproved };
};
