import { ChainId } from '@portkey/types';
import { MAIN_CHAIN_ID, MAIN_CHAIN, SIDE_CHAIN, TESTNET, TEST_NET } from '../../constants/network';
import { countryCodeMap } from '../../constants/ramp';
import { FiatType, GetFiatType, NetworkType, RampTypeEnum } from '../../types';
import { did } from '../../utils';
import { GetOrderQuoteParams } from '@portkey/services';
import { FetchTxFeeResultItemTransactionFee } from '@portkey/services';

export function transNetworkText(chainId: string, networkType: NetworkType): string {
  return `${chainId === MAIN_CHAIN_ID ? MAIN_CHAIN : SIDE_CHAIN} ${chainId}${
    networkType === TESTNET ? ' ' + TEST_NET : ''
  }`;
}

export const fetchBuyFiatListAsync = async (): Promise<FiatType[]> => {
  const rst: { data: GetFiatType[] } = await did.rampServices.getFiatList({
    type: RampTypeEnum.BUY,
  });
  const { data } = rst;
  const fiatMap: Record<string, FiatType> = {};
  data.forEach((item) => {
    const { currency, country } = item;
    const key = `${currency}-${country}`;
    if (!fiatMap[key]) {
      fiatMap[key] = item;
    }
  });

  return Object.values(fiatMap).map((item) => ({
    ...item,
    icon: countryCodeMap[item.country]?.icon,
  }));
};

export const fetchSellFiatListAsync = async (): Promise<FiatType[]> => {
  const rst: { data: FiatType[] } = await did.rampServices.getFiatList({
    type: RampTypeEnum.SELL,
  });
  const { data } = rst;
  const fiatMap: Record<string, FiatType> = {};
  data.forEach((item) => {
    const { currency, country } = item;
    const key = `${currency}-${country}`;
    if (!fiatMap[key]) {
      fiatMap[key] = item;
    }
  });

  return Object.values(fiatMap).map((item) => ({
    ...item,
    icon: countryCodeMap[item.country]?.icon,
  }));
};

export const getOrderQuote = async (params: GetOrderQuoteParams) => {
  const rst = await did.rampServices.getOrderQuote({
    ...params,
    type: 'ONE',
  });
  if (rst.returnCode !== '0000') {
    throw new Error(rst.returnMsg);
  }
  return rst.data;
};

export const getCryptoInfo = async (params: { fiat: string }, symbol: string, network: string, side: RampTypeEnum) => {
  const rst = await did.rampServices.getCryptoList(params);
  if (rst.returnCode !== '0000') {
    throw new Error(rst.returnMsg);
  }
  return rst.data.find(
    (item: any) =>
      item.crypto === symbol &&
      item.network === network &&
      (side === RampTypeEnum.BUY ? Number(item.buyEnable) === 1 : Number(item.sellEnable) === 1),
  );
};

export const fetchTxFeeAsync = async (
  chainIds: ChainId[],
): Promise<Record<ChainId, FetchTxFeeResultItemTransactionFee>> => {
  const result = await did.rampServices.fetchTxFee({
    chainIds,
  });

  const fee: any = {};
  result?.forEach((item: any) => {
    fee[item.chainId] = item.transactionFee;
  });

  return fee;
};
