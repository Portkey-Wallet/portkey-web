import type { ChainType } from '@portkey-v1/types';
import { SandboxErrorCode, SandboxEventService, SandboxEventTypes } from '../sandboxService';
import { did } from '../did';
import type { ChainId } from '@portkey-v1/types';
import { IHolderInfo } from '@portkey-v1/services';
import { isExtension } from '../lib';
import { PortkeyUIError } from '../../constants/error';
import { getChain } from '../../hooks/useChainInfo';

interface GetHolderInfoParam {
  sandboxId?: string;
  chainId: ChainId;
  chainType: ChainType;
  paramsOption: {
    loginGuardianIdentifier?: string;
    caHash?: string;
  };
}

export const getHolderInfoByExtension = async ({
  sandboxId,
  chainType,
  chainId,
  paramsOption,
}: Omit<GetHolderInfoParam, 'contract'>): Promise<IHolderInfo> => {
  const chainInfo = await getChain(chainId);
  if (!chainInfo) throw 'Please check network connection and chainId';
  const resMessage = await SandboxEventService.dispatchAndReceive(
    SandboxEventTypes.callViewMethod,
    {
      rpcUrl: chainInfo.endPoint,
      chainType,
      address: chainInfo.caContractAddress,
      methodName: 'GetHolderInfo',
      paramsOption,
    },
    sandboxId,
  );

  if (resMessage.code === SandboxErrorCode.error) throw resMessage.error;
  return resMessage.message;
};

export const getHolderInfoByContract = (params: GetHolderInfoParam) => {
  if (isExtension()) {
    if (!params.sandboxId) throw Error(PortkeyUIError.sandboxIdRequired);
    return getHolderInfoByExtension(params);
  }
  return did.didWallet.getHolderInfoByContract({
    caHash: params.paramsOption.caHash,
    loginGuardianIdentifier: params.paramsOption.loginGuardianIdentifier,
    chainId: params.chainId,
  });
};

export const getHolderInfoByApi = async (params: GetHolderInfoParam) => {
  return did.getHolderInfo({
    chainId: params.chainId,
    ...params.paramsOption,
  });
};

export const getHolderInfo = async (params: GetHolderInfoParam) => {
  if (isExtension()) {
    if (!params.sandboxId) throw Error(PortkeyUIError.sandboxIdRequired);
    return getHolderInfoByExtension(params);
  }
  return getHolderInfoByApi(params);
};
