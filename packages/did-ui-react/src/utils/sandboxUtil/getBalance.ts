import { ChainId, ChainType, ErrorMsg } from '@portkey/types';
import { SandboxErrorCode, SandboxEventService, SandboxEventTypes } from '../sandboxService';
import { getChain } from '../../hooks/useChainInfo';
import { getContractBasic } from '@portkey/contracts';
import { aelf } from '@portkey/utils';
import { COMMON_PRIVATE } from '../../constants';

interface GetBalanceParams {
  sandboxId?: string;
  chainId: ChainId;
  chainType: ChainType;
  paramsOption: {
    symbol: string;
    owner: string;
  };
}

interface GetBalanceResult {
  data?: { symbol: string; owner: string; balance: number };
  error?: ErrorMsg;
}

export const getBalanceByExtension = async ({ sandboxId, chainId, chainType, paramsOption }: GetBalanceParams) => {
  const chainInfo = await getChain(chainId);
  if (!chainInfo) throw 'Please check network connection and chainId';
  const resMessage = await SandboxEventService.dispatchAndReceive(
    SandboxEventTypes.callViewMethod,
    {
      rpcUrl: chainInfo.endPoint,
      chainType,
      address: chainInfo.caContractAddress,
      methodName: 'GetBalance',
      paramsOption,
    },
    sandboxId,
  );

  if (resMessage.code === SandboxErrorCode.error) throw resMessage.error;
  return resMessage.message;
};

export const getBalanceByContract = async (params: Omit<GetBalanceParams, 'chainType'>): Promise<GetBalanceResult> => {
  const chainInfo = await getChain(params.chainId);
  if (!chainInfo) throw 'Please check network connection and chainId';

  const contract = await getContractBasic({
    contractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
    account: aelf.getWallet(COMMON_PRIVATE),
    rpcUrl: chainInfo.endPoint,
  });

  const req = await contract.callViewMethod('GetBalance', {
    symbol: params.paramsOption.symbol,
    owner: params.paramsOption.owner,
  });

  if (req.error) throw req.error;
  return req.data;
};
