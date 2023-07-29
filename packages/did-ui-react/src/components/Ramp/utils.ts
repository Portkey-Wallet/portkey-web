import { MAIN_CHAIN_ID, MAIN_CHAIN, SIDE_CHAIN, TESTNET, TEST_NET } from '../../constants/network';
import { countryCodeMap } from '../../constants/ramp';
import { FiatType, GetFiatType, RampTypeEnum } from '../../types';
import { did } from '../../utils';

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

export function transNetworkText(chainId: string, networkType: string): string {
  return `${chainId === MAIN_CHAIN_ID ? MAIN_CHAIN : SIDE_CHAIN} ${chainId}${
    networkType === TESTNET ? ' ' + TEST_NET : ''
  }`;
}
