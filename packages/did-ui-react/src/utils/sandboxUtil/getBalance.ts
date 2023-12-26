import { ChainId, ChainType } from '@portkey-v1/types';
import { SandboxErrorCode, SandboxEventService, SandboxEventTypes } from '../sandboxService';
import { getChain } from '../../hooks/useChainInfo';
import { getContractBasic } from '@portkey-v1/contracts';
import { aelf } from '@portkey-v1/utils';
import { COMMON_PRIVATE } from '../../constants';
import { isExtension } from '../lib';
import { PortkeyUIError } from '../../constants/error';

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

export const getBalanceOnSandbox = async ({
  sandboxId,
  chainId,
  chainType,
  paramsOption,
  tokenContractAddress,
}: GetBalanceParams) => {
  const chainInfo = await getChain(chainId);
  if (!chainInfo) throw 'Please check network connection and chainId';
  const resMessage = await SandboxEventService.dispatchAndReceive(
    SandboxEventTypes.callViewMethod,
    {
      rpcUrl: chainInfo.endPoint,
      chainType,
      address: tokenContractAddress,
      methodName: 'GetBalance',
      paramsOption,
    },
    sandboxId,
  );

  if (resMessage.code === SandboxErrorCode.error) throw resMessage.error;
  return resMessage.message;
};

export const getBalanceOnWeb = async (params: Omit<GetBalanceParams, 'chainType'>): Promise<GetBalanceResult> => {
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

export const getBalanceByContract = async (params: GetBalanceParams) => {
  if (isExtension()) {
    if (!params.sandboxId) throw Error(PortkeyUIError.sandboxIdRequired);
    return getBalanceOnSandbox(params);
  }
  return getBalanceOnWeb(params);
};
