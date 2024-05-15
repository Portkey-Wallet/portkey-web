import { ChainId, ChainType } from '@portkey/types';
import { BaseToken } from '../../components/types/assets';
import { callCASendMethod } from './callCASendMethod';
import { GuardianApprovedItem } from '../../components/Guardian/utils/type';

const sameChainTransfer = async ({
  chainId,
  sandboxId,
  chainType,
  privateKey,
  caHash,
  amount,
  tokenInfo,
  memo = '',
  toAddress: to,
  guardiansApproved,
}: {
  sandboxId?: string;
  chainId: ChainId;
  chainType: ChainType;
  privateKey: string;
  tokenInfo: BaseToken;
  caHash: string;
  amount: number;
  toAddress: string;
  memo?: string;
  guardiansApproved?: GuardianApprovedItem[];
}) => {
  return callCASendMethod({
    sandboxId,
    contractAddress: tokenInfo.address,
    methodName: 'Transfer',
    paramsOption: {
      symbol: tokenInfo.symbol,
      to,
      amount,
      memo,
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

export default sameChainTransfer;
