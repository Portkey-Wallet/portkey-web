import { ChainId, ChainType, ErrorMsg, ViewResult } from '@portkey/types';
import { SandboxEventService, SandboxEventTypes, SandboxErrorCode } from '..';
import { getChain } from '../../hooks/useChainInfo';
import { getContractBasic } from '@portkey/contracts';
import { aelf } from '@portkey/utils';

interface GetTransitionFeeParams {
  sandboxId?: string;
  chainId: ChainId;
  chainType: ChainType;
  paramsOption: GetTransitionFeeParamsOption;
  tokenContractAddress: string;
  privateKey: string;
}

interface GetTransitionFeeParamsOption {
  caHash: string;
  contractAddress: string;
  methodName: string;
  args: {
    symbol: string;
    to: string;
    amount: number;
  };
}

const MethodName = 'ManagerForwardCall';

export const getTransactionRawByExtension = async ({
  sandboxId,
  chainId,
  paramsOption,
  chainType,
  privateKey,
}: GetTransitionFeeParams) => {
  const chainInfo = await getChain(chainId);
  if (!chainInfo) throw 'Please check network connection and chainId';

  const resMessage = await SandboxEventService.dispatchAndReceive(
    SandboxEventTypes.getTransactionRaw,
    {
      rpcUrl: chainInfo.endPoint,
      address: chainInfo.caContractAddress,
      chainType,
      methodName: MethodName,
      privateKey,
      paramsOption,
    },
    sandboxId,
  );

  if (resMessage.code === SandboxErrorCode.error) throw resMessage.error;
  return resMessage.message;
};

export const getTransactionRawByContract = async (
  params: Omit<GetTransitionFeeParams, 'chainType'>,
): Promise<{ result: { data: string } }> => {
  const chainInfo = await getChain(params.chainId);
  if (!chainInfo) throw 'Please check network connection and chainId';

  const contract = await getContractBasic({
    contractAddress: params.tokenContractAddress,
    account: aelf.getWallet(params.privateKey),
    rpcUrl: chainInfo.endPoint,
  });
  const req = await contract.encodedTx(MethodName, params.paramsOption);
  if (req.error) throw req.error;
  return req.data;
};
