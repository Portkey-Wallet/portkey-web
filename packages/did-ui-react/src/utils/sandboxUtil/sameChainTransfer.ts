import { ChainId, ChainType } from '@portkey-v1/types';
import { BaseToken } from '../../components/types/assets';
import { callCASendMethod } from './callCASendMethod';

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
  });
};

export default sameChainTransfer;
