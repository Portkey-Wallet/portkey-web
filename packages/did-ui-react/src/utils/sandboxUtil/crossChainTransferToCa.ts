import { ChainId } from '@portkey-v1/types';
import { getChain } from '../../hooks/useChainInfo';
import { SandboxErrorCode, SandboxEventService, SandboxEventTypes } from '../sandboxService';
import { BaseSendOption } from './types';
import { aelf } from '@portkey-v1/utils';
import { getContractBasic } from '@portkey-v1/contracts';

interface CrossChainTransferToCaProps extends Omit<BaseSendOption, 'rpcUrl' | 'address'> {
  chainId: ChainId;
  contractAddress: string;
  paramsOption: {
    issueChainId: number;
    toChainId: number;
    symbol: string;
    to: string;
    amount: number;
    memo?: string;
  };
}

export const crossChainTransferToCaOnSandbox = async ({
  chainId,
  chainType,
  privateKey,
  contractAddress,
  paramsOption,
  sendOptions,
}: CrossChainTransferToCaProps) => {
  if (!paramsOption.memo) {
    delete paramsOption.memo;
  }
  const chainInfo = await getChain(chainId);
  if (!chainInfo) throw 'Please check network connection and chainId';
  const resMessage = await SandboxEventService.dispatchAndReceive(SandboxEventTypes.callSendMethod, {
    rpcUrl: chainInfo.endPoint,
    address: contractAddress,
    privateKey,
    chainType,
    methodName: 'CrossChainTransfer',
    paramsOption,
    sendOptions,
  });

  if (resMessage.code === SandboxErrorCode.error) throw resMessage.error;
  const message = resMessage.message;
  return {
    code: resMessage.code,
    result: {
      rpcUrl: chainInfo.endPoint,
      message,
    },
  };
};

export const crossChainTransferToCa = async ({
  chainId,
  chainType,
  privateKey,
  paramsOption,
  contractAddress,
  sendOptions,
}: CrossChainTransferToCaProps) => {
  if (!paramsOption.memo) {
    delete paramsOption.memo;
  }
  const chainInfo = await getChain(chainId);
  if (!chainInfo) throw 'Please check network connection and chainId';
  const account = aelf.getWallet(privateKey);
  const contract = await getContractBasic({
    rpcUrl: chainInfo.endPoint,
    account,
    contractAddress,
    chainType,
  });

  return contract.callSendMethod('CrossChainTransfer', account.address, paramsOption, sendOptions);
};
