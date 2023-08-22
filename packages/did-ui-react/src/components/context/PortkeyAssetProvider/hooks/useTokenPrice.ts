import { useMemo } from 'react';
import { usePortkeyAsset } from '../index';
import { basicAssetViewAsync } from '../actions';
import { useThrottleEffect } from '../../../../hooks/throttle';

export function useTokenPrice(symbol = '') {
  const [{ tokenPrices }, { dispatch }] = usePortkeyAsset();

  useThrottleEffect(() => {
    symbol && basicAssetViewAsync.setTokenPrices({ symbols: [symbol] }).then(dispatch);
  }, [symbol]);
  return useMemo(() => tokenPrices?.tokenPriceObject?.[symbol] || 0, [symbol, tokenPrices?.tokenPriceObject]);
}
