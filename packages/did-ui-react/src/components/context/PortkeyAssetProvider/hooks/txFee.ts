import { ChainId } from '@portkey/types';
import { useMemo, useCallback } from 'react';
import { InitialTxFee } from '../../../../constants/assets';
import { usePortkeyAsset } from '..';
import { basicAssetViewAsync } from '../actions';
import useDebounce from '../../../../hooks/useDebounce';

export const useTxFeeInit = () => {
  const [{ caAddressInfos }, { dispatch }] = usePortkeyAsset();
  const chainIdArray = useMemo(() => caAddressInfos?.map((info) => info.chainId as ChainId), [caAddressInfos]);

  const getTx = useCallback(() => {
    chainIdArray && basicAssetViewAsync.setTxFee(chainIdArray).then(dispatch);
  }, [chainIdArray, dispatch]);

  useDebounce(getTx, 300);

  return null;
};

export const useFeeByChainId = (chainId: ChainId) => {
  const [{ txFee }] = usePortkeyAsset();

  const targetTxFee = useMemo(() => txFee?.[chainId] || InitialTxFee, [chainId, txFee]);

  return useMemo(() => targetTxFee, [targetTxFee]);
};
