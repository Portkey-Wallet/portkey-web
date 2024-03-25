import { getSellCrypto, getSellFiat } from './api';

export const getSellData = async () => {
  const { cryptoList, defaultCrypto } = await getSellCrypto();
  const { sellFiatList, sellDefaultFiat } = await getSellFiat({
    crypto: defaultCrypto.symbol,
    network: defaultCrypto.network,
  });

  return {
    sellCryptoList: cryptoList,
    sellDefaultCrypto: defaultCrypto,
    sellDefaultFiatList: sellFiatList,
    sellDefaultFiat,
  };
};
