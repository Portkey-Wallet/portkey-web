import { isExtension } from '../lib';
import { PortkeyUIError } from '../../constants/error';
import { SandboxErrorCode, SandboxEventService, SandboxEventTypes } from '../sandboxService';
import { getChain } from '../../hooks/useChainInfo';
import { ChainId, ChainType, SendOptions } from '@portkey/types';
import { getContractBasic } from '@portkey/contracts';
import { aelf } from '@portkey/utils';
import { handleErrorMessage } from '../errorHandler';

export interface CallCASendMethodParams {
  methodName: string;
  paramsOption: any;
  sandboxId?: string;
  chainId: ChainId;
  caHash: string;
  chainType: ChainType;
  contractAddress: string;
  privateKey: string;
  sendOptions?: SendOptions;
}
/** @alpha */
export const callCASendMethodOnExtension = async ({ sandboxId, ...params }: CallCASendMethodParams) => {
  const chainInfo = await getChain(params.chainId);
  if (!chainInfo) throw 'Please check network connection and chainId';
  const resMessage = await SandboxEventService.dispatchAndReceive(
    SandboxEventTypes.callCASendMethod,
    {
      chainType: params.chainType,
      rpcUrl: chainInfo.endPoint,
      contractAddress: params.contractAddress,
      methodName: params.methodName,
      privateKey: params.privateKey,
      caContractAddress: chainInfo.caContractAddress,
      caHash: params.caHash,
      paramsOption: params.caHash,
      sendOptions: params.sendOptions,
    },
    sandboxId,
  );

  if (resMessage.code === SandboxErrorCode.error) throw resMessage.error.message;
  return {
    code: resMessage.code,
    result: {
      rpcUrl: chainInfo.endPoint,
      ...resMessage.message,
    },
  };
};

export const callCASendMethodOnWeb = async (params: CallCASendMethodParams) => {
  const chainInfo = await getChain(params.chainId);
  if (!chainInfo) throw 'Please check network connection and chainId';
  const account = aelf.getWallet(params.privateKey);
  const contract = await getContractBasic({
    contractAddress: params.contractAddress,
    account,
    caContractAddress: chainInfo.caContractAddress,
    callType: 'ca',
    caHash: params.caHash,
    rpcUrl: chainInfo.endPoint,
  });

  const req = await contract.callSendMethod(
    params.methodName,
    account.address,
    params.paramsOption,
    params.sendOptions,
  );
  console.log('callCASendMethodOnWeb callSendMethod req:', req);
  if (req.error) throw handleErrorMessage(req);
  return req.data;
};

export const callCASendMethod = (params: CallCASendMethodParams) => {
  const extension = isExtension();
  const { sandboxId } = params;
  if (extension) {
    if (!sandboxId) throw Error(PortkeyUIError.sandboxIdRequired);
    return callCASendMethodOnExtension(params);
  }
  return callCASendMethodOnWeb(params);
};
