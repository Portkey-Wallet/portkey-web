import { did } from '@portkey/did';
import { FetchTxFeeResultItemTransactionFee } from '@portkey/services';
import { ChainId } from '@portkey/types';

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
