import { ChainType } from '@portkey-v1/types';
import { SandboxErrorCode, SandboxEventService, SandboxEventTypes } from '../sandboxService';
import { getContractBasic } from '@portkey-v1/contracts';
import { aelf } from '@portkey-v1/utils';
import { FetchRequest } from '@portkey-v1/request';

interface GetTransitionFeeParams {
  rpcUrl: string;
  contractAddress: string;
  chainType: ChainType;
  paramsOption: any;
  methodName: string;
  privateKey: string;
}

export const getTransactionFeeOnSandbox = async ({
  rpcUrl,
  contractAddress,
  paramsOption,
  chainType,
  methodName,
  privateKey,
}: GetTransitionFeeParams) => {
  const resMessage = await SandboxEventService.dispatchAndReceive(SandboxEventTypes.getTransactionFee, {
    rpcUrl,
    address: contractAddress,
    paramsOption,
    chainType,
    methodName,
    privateKey,
  });

  if (resMessage.code === SandboxErrorCode.error) throw resMessage.error;
  return {
    code: resMessage.code,
    result: {
      rpcUrl,
      ...resMessage.message,
    },
  };
};

export const getTransactionFee = async ({
  paramsOption,
  chainType,
  methodName,
  rpcUrl,
  privateKey,
  contractAddress,
}: GetTransitionFeeParams) => {
  const contract = await getContractBasic({
    contractAddress,
    account: aelf.getWallet(privateKey),
    rpcUrl,
    chainType,
  });
  const rawRes = await contract.encodedTx(methodName, paramsOption);
  if (rawRes.error) throw rawRes.error;
  const customFetch = new FetchRequest({});

  const transaction = await customFetch.send({
    url: `${rpcUrl}/api/blockChain/calculateTransactionFee`,
    method: 'POST',
    params: {
      RawTransaction: rawRes.data,
    },
  });
  if (!transaction?.Success) throw 'Transaction failed';

  return transaction;
};
