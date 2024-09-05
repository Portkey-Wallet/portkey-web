import { AccountType, AccountTypeEnum, GuardiansApproved } from '@portkey/services';
import { GuardianApprovedItem, UserGuardianStatus } from '../../../types';
import { formatGuardianValue } from './formatGuardianValue';
import { isEOAWalletGuardian, zkGuardianType } from '../../../constants/guardian';
import { handleEOAWalletRequestInfo, handleZKLoginInfo } from '../../../utils/guardian';

export const formatAddGuardianValue = ({
  approvalInfo,
  currentGuardian,
}: {
  approvalInfo?: GuardiansApproved[];
  currentGuardian?: UserGuardianStatus;
}) => {
  let guardianToAdd: GuardianApprovedItem;
  if (zkGuardianType.includes(currentGuardian?.guardianType as AccountType)) {
    guardianToAdd = {
      type: AccountTypeEnum[currentGuardian?.guardianType as AccountType],
      identifierHash: currentGuardian?.identifierHash,
      verificationInfo: {
        id: currentGuardian?.verifier?.id || '',
      },
      zkLoginInfo: handleZKLoginInfo(currentGuardian?.zkLoginInfo),
    };
  } else if (isEOAWalletGuardian(currentGuardian?.guardianType)) {
    guardianToAdd = {
      type: AccountTypeEnum[currentGuardian?.guardianType as AccountType],
      identifierHash: currentGuardian?.identifierHash,
      verificationExt: handleEOAWalletRequestInfo(currentGuardian?.verificationRequestInfo),
    };
  } else {
    guardianToAdd = {
      type: AccountTypeEnum[currentGuardian?.guardianType as AccountType],
      identifierHash: currentGuardian?.identifierHash,
      verificationInfo: {
        id: currentGuardian?.verifier?.id || '',
        signature: Object.values(Buffer.from(currentGuardian?.signature as any, 'hex')),
        verificationDoc: currentGuardian?.verificationDoc || '',
      },
    };
  }
  const guardiansApproved: GuardianApprovedItem[] = formatGuardianValue(approvalInfo);
  return { guardianToAdd, guardiansApproved };
};
