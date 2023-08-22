import { ChainId } from '@portkey/types';
import { useMemo } from 'react';
import { InitialTxFee } from '../../../../constants/assets';
import { usePortkeyAsset } from '..';
import { useThrottleEffect } from '../../../../hooks/throttle';
import { basicAssetViewAsync } from '../actions';

export const useTxFeeInit = () => {
  const [{ caAddressInfos }, { dispatch }] = usePortkeyAsset();
  const chainIdArray = useMemo(() => caAddressInfos?.map((info) => info.chainId as ChainId), [caAddressInfos]);
  useThrottleEffect(() => {
    chainIdArray && basicAssetViewAsync.setTxFee(chainIdArray).then(dispatch);
  }, [chainIdArray]);

  return null;
};

export const useFeeByChainId = (chainId: ChainId) => {
  const [{ txFee }] = usePortkeyAsset();

  const targetTxFee = useMemo(() => txFee?.[chainId] || InitialTxFee, [chainId, txFee]);

  return useMemo(() => targetTxFee, [targetTxFee]);
};
