import { useCallback } from 'react';
import { usePortkeyAsset } from '../index';
export * from './useTokenPrice';

export function usePortkeyAssetDispatch() {
  const [, { dispatch }] = usePortkeyAsset();
  return useCallback(dispatch, [dispatch]);
}
