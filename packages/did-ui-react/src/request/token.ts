import { did } from '@portkey-v1/did';
import { FetchTxFeeResultItemTransactionFee } from '@portkey-v1/services';
import { ChainId } from '@portkey-v1/types';

export const fetchTxFeeAsync = async (
  chainIds: ChainId[],
): Promise<Record<ChainId, FetchTxFeeResultItemTransactionFee>> => {
  const result = await did.services.token.fetchTxFee({
    chainIds,
  });

  const fee: any = {};
  result?.forEach((item: any) => {
    fee[item.chainId] = item.transactionFee;
  });

  return fee;
};
