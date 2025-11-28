import { IGetFiatDataRequest, IRampCryptoItem } from '@portkey/ramp';
import { getBuyFiat, getBuyCrypto } from './api';

export const getBuyData = async () => {
  const { fiatList, defaultFiat } = await getBuyFiat();
  const { buyCryptoList, buyDefaultCrypto } = await getBuyCrypto({
    fiat: defaultFiat.symbol,
    country: defaultFiat.country,
  });

  return {
    buyFiatList: fiatList,
    buyDefaultFiat: defaultFiat,
    buyDefaultCryptoList: buyCryptoList,
    buyDefaultCrypto,
  };
};

export const getSpecifiedBuyFiat = async ({ crypto, network }: IGetFiatDataRequest) => {
  let specifiedCrypto: IRampCryptoItem[] = [];
  if (!network) {
    const { buyCryptoList } = await getBuyCrypto({});
    specifiedCrypto = buyCryptoList.filter((item) => item.symbol === crypto, []);

    if (!specifiedCrypto[0].network) return;
    network = specifiedCrypto[0].network;
  }
  const { fiatList, defaultFiat } = await getBuyFiat({ crypto, network });

  return { fiatList, defaultFiat, defaultCrypto: specifiedCrypto?.[0] };
};
