import { ChainId, ChainType } from '@portkey/types';
import { SandboxErrorCode, SandboxEventService, SandboxEventTypes } from '../sandboxService';
import { getChain } from '../../hooks/useChainInfo';
import { getContractBasic } from '@portkey/contracts';
import { aelf } from '@portkey/utils';
import { COMMON_PRIVATE } from '../../constants';

interface GetBalanceParams {
  sandboxId?: string;
  chainId: ChainId;
  tokenContractAddress: string;
  chainType: ChainType;
  paramsOption: {
    symbol: string;
    owner: string;
  };
}

interface GetBalanceResult {
  symbol: string;
  owner: string;
  balance: number;
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
    contractAddress: params.tokenContractAddress,
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