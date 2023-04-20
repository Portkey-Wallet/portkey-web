import type { ChainType } from '@portkey/types';
import { SandboxErrorCode, SandboxEventService, SandboxEventTypes } from '../sandboxService';
import { did } from '../did';
import type { ChainId } from '@portkey/types';
import { IHolderInfo } from '@portkey/services';

interface GetHolderInfoParam {
  sandboxId?: string;
  chainId: ChainId;
  rpcUrl: string;
  address: string; // contract address
  chainType: ChainType;
  paramsOption: {
    loginGuardianIdentifier?: string;
    caHash?: string;
  };
}

export const getHolderInfoByExtension = async ({
  sandboxId,
  rpcUrl,
  chainType,
  address,
  paramsOption,
}: Omit<GetHolderInfoParam, 'contract'>): Promise<IHolderInfo> => {
  const resMessage = await SandboxEventService.dispatchAndReceive(
    SandboxEventTypes.callViewMethod,
    {
      rpcUrl,
      chainType,
      address,
      methodName: 'GetHolderInfo',
      paramsOption,
    },
    sandboxId,
  );

  if (resMessage.code === SandboxErrorCode.error) throw resMessage.error;
  return resMessage.message;
};

export const getHolderInfoByApi = async (params: GetHolderInfoParam) => {
  return did.getHolderInfo({
    chainId: params.chainId,
    ...params.paramsOption,
  });
};

export const getHolderInfo = async (params: GetHolderInfoParam) => getHolderInfoByApi(params);
