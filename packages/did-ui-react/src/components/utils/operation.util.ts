import { OperationTypeEnum } from '@portkey/services';
import { getManagementAccount } from '../checkManagerCreate';

export function getOperationDetails(
  operationType: OperationTypeEnum,
  extra?: {
    identifierHash?: string;
    guardianType?: string;
    verifierId?: string;
    preVerifierId?: string;
    newVerifierId?: string;
    symbol?: string;
    amount?: string | number;
    toAddress?: string;
    singleLimit?: string;
    dailyLimit?: string;
    spender?: string;
  },
) {
  if (operationType === OperationTypeEnum.register || operationType === OperationTypeEnum.communityRecovery) {
    return JSON.stringify({ manager: getManagementAccount().address });
  }
  // if (!guardian) return '{}';
  if (
    operationType === OperationTypeEnum.addGuardian ||
    operationType === OperationTypeEnum.deleteGuardian ||
    operationType === OperationTypeEnum.setLoginAccount ||
    operationType === OperationTypeEnum.unsetLoginAccount
  ) {
    const { identifierHash, guardianType, verifierId } = extra || {};
    return JSON.stringify({
      identifierHash,
      guardianType: getGuardianTypeValue(guardianType),
      verifierId,
      manager: getManagementAccount().address,
    });
  }
  if (operationType === OperationTypeEnum.editGuardian) {
    const { identifierHash, guardianType } = extra || {};
    const { preVerifierId, newVerifierId } = extra || {};
    return JSON.stringify({
      identifierHash,
      guardianType: getGuardianTypeValue(guardianType),
      preVerifierId,
      newVerifierId,
      manager: getManagementAccount().address,
    });
  }
  if (operationType === OperationTypeEnum.transferApprove) {
    const { symbol, amount, toAddress } = extra || {};
    return JSON.stringify({ symbol, amount, toAddress, manager: getManagementAccount().address });
  }
  if (operationType === OperationTypeEnum.managerApprove) {
    const { spender, amount, symbol } = extra || {};
    return JSON.stringify({ spender, symbol, amount, manager: getManagementAccount().address });
  }
  if (operationType === OperationTypeEnum.modifyTransferLimit) {
    const { symbol, singleLimit, dailyLimit } = extra || {};
    return JSON.stringify({ symbol, singleLimit, dailyLimit, manager: getManagementAccount().address });
  }
  return '{}';
}
function getGuardianTypeValue(guardianType?: string) {
  if (guardianType === 'Email') {
    return 0;
  } else if (guardianType === 'Google') {
    return 2;
  } else if (guardianType === 'Apple') {
    return 3;
  } else if (guardianType === 'Telegram') {
    return 4;
  } else if (guardianType === 'Facebook') {
    return 5;
  } else if (guardianType === 'Twitter') {
    return 6;
  } else {
    return guardianType;
  }
}
