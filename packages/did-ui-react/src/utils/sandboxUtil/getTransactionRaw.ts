import { ChainId, ChainType } from '@portkey/types';
import { handleErrorMessage } from '..';
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
  caHash: string;
  methodName: string;
}

interface GetTransitionFeeParamsOption {
  symbol: string;
  to: string;
  amount: number;
}

export const getTransactionRawByContract = async (
  params: Omit<GetTransitionFeeParams, 'chainType'>,
): Promise<{ result: { data: string } }> => {
  const chainInfo = await getChain(params.chainId);
  if (!chainInfo) throw 'Please check network connection and chainId';

  const account = aelf.getWallet(params.privateKey);

  const contract = await getContractBasic({
    contractAddress: params.tokenContractAddress,
    account,
    caContractAddress: chainInfo.caContractAddress,
    callType: 'ca',
    caHash: params.caHash,
    rpcUrl: chainInfo.endPoint,
  });

  const req = await contract.callSendMethod(params.methodName, account, params.paramsOption);
  console.log(req, params.paramsOption, 'req===callCASendMethod');
  if (req.error) throw handleErrorMessage(req);
  return req.data;
};
