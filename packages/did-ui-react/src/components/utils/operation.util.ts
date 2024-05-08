import { OperationTypeEnum } from '@portkey/services';
import { getManagementAccount } from '../checkManagerCreate';
import { UserGuardianStatus } from '../../types';

export function getOperationDetails(
  operationType: OperationTypeEnum,
  guardian?: UserGuardianStatus,
  extra?: {
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
  if (!guardian) return '{}';
  if (
    operationType === OperationTypeEnum.addGuardian ||
    operationType === OperationTypeEnum.deleteGuardian ||
    operationType === OperationTypeEnum.setLoginAccount ||
    operationType === OperationTypeEnum.unsetLoginAccount
  ) {
    const { identifierHash, guardianType, verifierId } = guardian;
    return JSON.stringify({ identifierHash, guardianType, verifierId });
  }
  if (operationType === OperationTypeEnum.editGuardian) {
    const { identifierHash, guardianType } = guardian;
    const { preVerifierId, newVerifierId } = extra || {};
    return JSON.stringify({ identifierHash, guardianType, preVerifierId, newVerifierId });
  }
  if (operationType === OperationTypeEnum.transferApprove) {
    const { symbol, amount, toAddress } = extra || {};
    return JSON.stringify({ symbol, amount, toAddress });
  }
  if (operationType === OperationTypeEnum.managerApprove) {
    const { spender, amount, symbol } = extra || {};
    return JSON.stringify({ spender, symbol, amount });
  }
  if (operationType === OperationTypeEnum.modifyTransferLimit) {
    const { symbol, singleLimit, dailyLimit } = extra || {};
    return JSON.stringify({ symbol, singleLimit, dailyLimit });
  }
  return '{}';
}
export function getOperationDetailsByGuardian(operationType: OperationTypeEnum, guardian?: UserGuardianStatus) {
  // if (operationType === OperationTypeEnum.register || operationType === OperationTypeEnum.communityRecovery) {
  //   return JSON.stringify({ manager: getManagementAccount().address });
  // }
  if (!guardian) return '{}';
  if (
    operationType === OperationTypeEnum.addGuardian ||
    operationType === OperationTypeEnum.deleteGuardian ||
    operationType === OperationTypeEnum.setLoginAccount ||
    operationType === OperationTypeEnum.unsetLoginAccount
  ) {
    const { identifierHash, guardianType, verifierId } = guardian;
    return JSON.stringify({ identifierHash, guardianType, verifierId });
  }
  if (operationType === OperationTypeEnum.editGuardian) {
    const { identifierHash, guardianType } = guardian;
  }
  return '{}';
}
