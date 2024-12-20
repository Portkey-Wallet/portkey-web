import { ChainId, ChainType } from '@portkey/types';
import { BaseToken } from '../../components/types/assets';
import { callCASendMethod } from './callCASendMethod';
import { GuardianApprovedItem } from '../../types';
import { getChainNumber } from '../aelf';
import { IPortkeyContract } from '@portkey/contracts';

const crossChainTransferV2 = async ({
  chainId,
  sandboxId,
  chainType,
  privateKey,
  caHash,
  amount,
  tokenInfo,
  memo = '',
  toAddress: to,
  toChainId,
  guardiansApproved,
  tokenContract,
}: {
  tokenContract: IPortkeyContract;
  sandboxId?: string;
  chainId: ChainId;
  chainType: ChainType;
  privateKey: string;
  tokenInfo: BaseToken;
  caHash: string;
  amount: number;
  toAddress: string;
  toChainId: ChainId;
  memo?: string;
  guardiansApproved?: GuardianApprovedItem[];
}) => {
  const tokenInfoResult = await tokenContract.callViewMethod('GetTokenInfo', { symbol: tokenInfo.symbol });
  const tokenIssueChainId = tokenInfoResult.data.issueChainId;

  return callCASendMethod({
    sandboxId,
    contractAddress: tokenInfo.address,
    methodName: '.CrossChain',
    paramsOption: {
      symbol: tokenInfo.symbol,
      to,
      amount,
      memo,
      toChainId: getChainNumber(toChainId),
      issueChainId: tokenIssueChainId,
    },
    chainId,
    caHash,
    chainType,
    privateKey,
    sendOptions: {
      appendParams: { guardiansApproved },
    },
  });
};

export default crossChainTransferV2;
