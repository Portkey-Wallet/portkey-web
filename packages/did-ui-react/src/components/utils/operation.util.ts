import { OperationTypeEnum } from '@portkey/services';
import { getManagementAccount } from '../checkManagerCreate';

export function getOperationDetails(operationType: OperationTypeEnum) {
  if (operationType === OperationTypeEnum.register || operationType === OperationTypeEnum.communityRecovery) {
    return JSON.stringify({ manager: getManagementAccount().address });
  }
  return '{}';
}
