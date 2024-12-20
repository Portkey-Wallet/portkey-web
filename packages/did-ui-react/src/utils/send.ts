import { did } from '../..';
import { INetworkItem } from '../components/Send/components/SelectNetwork';
import { ZERO } from '../constants/misc';
import { TransferTypeEnum } from '../types/send';

export function getSmallerValue(v1: string, v2: string) {
  if (!v1 || !v2) {
    throw 'invalid value';
  }
  return ZERO.plus(v1).isGreaterThan(v2) ? v2 : v1;
}

export function getLimitTips(symbol: string, from: string | number, to: string | number) {
  return `Transfer limit: ${from} to ${to} ${symbol}`;
}

export const getEstimatedTime = (targetNetwork?: INetworkItem, transferType?: TransferTypeEnum) => {
  if (!targetNetwork) return '';

  const transferItem = targetNetwork?.serviceList?.find((ele) =>
    ele?.serviceName?.toLocaleLowerCase()?.includes('transfer'),
  );
  const bridgeItem = targetNetwork?.serviceList?.find((ele) =>
    ele?.serviceName?.toLocaleLowerCase()?.includes('bridge'),
  );

  if (transferType === TransferTypeEnum.E_TRANSFER) {
    return transferItem?.multiConfirmTime;
  }
  if (transferType === TransferTypeEnum.E_BRIDGE) {
    return bridgeItem?.multiConfirmTime;
  }
  return '';
};

export const getCrossChainTransferVersion = async (): Promise<{ isOpen: boolean }> => {
  return did.services.common.getCrossChainSwitch();
};
