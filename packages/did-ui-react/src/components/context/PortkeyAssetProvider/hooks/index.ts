import { useCallback } from 'react';
import { usePortkeyAsset } from '../index';

export function usePortkeyDispatch() {
  const [, { dispatch }] = usePortkeyAsset();
  return useCallback(dispatch, [dispatch]);
}
