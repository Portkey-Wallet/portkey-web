import { ChainId, ChainType } from '@portkey/types';
import { SandboxErrorCode, SandboxEventService, SandboxEventTypes, handleErrorMessage, isExtension } from '../index';
import { getChain } from '../../hooks/useChainInfo';
import { getContractBasic } from '@portkey/contracts';
import { aelf } from '@portkey/utils';
import { PortkeyUIError } from '../../constants/error';
import { CallOptions } from '@portkey/types';

interface CATransactionRawParams<T = any> {
  sandboxId?: string;
  chainId: ChainId;
  chainType: ChainType;
  paramsOption: T;
  contractAddress: string;
  privateKey: string;
  caHash: string;
  methodName: string;
  callOptions?: CallOptions;
}

export const getCATransactionRawOnSandbox = async (params: CATransactionRawParams) => {
  const { chainId, privateKey, caHash, chainType, contractAddress, methodName, paramsOption } = params;
  const chainInfo = await getChain(chainId);
  if (!chainInfo) throw 'Please check network connection and chainId';

  const resMessage = await SandboxEventService.dispatchAndReceive(SandboxEventTypes.getTransactionRaw, {
    rpcUrl: chainInfo.endPoint,
    address: chainInfo.caContractAddress,
    methodName: 'ManagerForwardCall',
    privateKey,
    paramsOption: {
      caHash,
      contractAddress,
      methodName,
      args: paramsOption,
    },
    chainType,
  });

  if (resMessage.code === SandboxErrorCode.error) throw handleErrorMessage(resMessage.message);
  return resMessage.message;
};

export const getCATransactionRawOnWeb = async (params: Omit<CATransactionRawParams, 'chainType'>) => {
  const { chainId, privateKey, caHash, contractAddress, methodName, paramsOption, callOptions } = params;
  const chainInfo = await getChain(chainId);
  if (!chainInfo) throw 'Please check network connection and chainId';

  const account = aelf.getWallet(privateKey);

  const contract = await getContractBasic({
    contractAddress: chainInfo.caContractAddress,
    account,
    rpcUrl: chainInfo.endPoint,
  });

  const options: any = {
    caHash,
    contractAddress,
    methodName,
  };

  // const methods = await getContractMethods((contract as any).aelfInstance, options.contractAddress);
  // const inputType = methods[options.methodName];

  options.args = paramsOption;

  const rawResult = await contract.encodedTx('ManagerForwardCall', options, callOptions);
  if (!rawResult || !rawResult.data) {
    throw new Error('Failed to get raw transaction.');
  }
  if (rawResult.error) throw handleErrorMessage(rawResult);
  return rawResult.data;
};

export const getCATransactionRaw = <T = any, R = any>(params: CATransactionRawParams<T>): Promise<R> => {
  const extension = isExtension();
  const { sandboxId } = params;
  if (extension) {
    if (!sandboxId) throw Error(PortkeyUIError.sandboxIdRequired);
    return getCATransactionRawOnSandbox(params);
  }
  return getCATransactionRawOnWeb(params);
};
