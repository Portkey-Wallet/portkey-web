import { IRampCryptoItem } from '@portkey/ramp';
import { useCallback, useEffect, useState } from 'react';
import { getBuyCrypto } from '../utils/api';
import { ChainId } from '@portkey/types';
import { usePortkeyAsset } from '../..';
import { getChainInfo } from '../../../hooks';

export const useBuyCryptoList = () => {
  const [buyCryptoList, setBuyCryptoList] = useState<IRampCryptoItem[]>();

  const refresh = useCallback(async () => {
    const { buyCryptoList } = await getBuyCrypto({});
    setBuyCryptoList(buyCryptoList);
  }, []);

  return {
    buyCryptoList,
    refresh,
  };
};
