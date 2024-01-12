import { countryCodeMap } from '../../constants/ramp';
import { FiatType, GetFiatType, RampTypeEnum } from '../../types';
import { did } from '../../utils';
import { GetOrderQuoteParams } from '@portkey/services';

export const fetchBuyFiatListAsync = async (): Promise<FiatType[]> => {
  const rst: { data: GetFiatType[] } = await did.services.ramp.getFiatList({
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
  const rst: { data: FiatType[] } = await did.services.ramp.getFiatList({
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
  const rst = await did.services.ramp.getOrderQuote({
    ...params,
    type: 'ONE',
  });
  if (rst.returnCode !== '0000') {
    throw new Error(rst.returnMsg);
  }
  return rst.data;
};

export const getCryptoInfo = async (params: { fiat: string }, symbol: string, network: string, side: RampTypeEnum) => {
  const rst = await did.services.ramp.getCryptoList(params);
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
