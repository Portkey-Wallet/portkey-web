import { useCallback } from 'react';
import { usePortkey } from './index';

export function useWalletDispatch() {
  const [, { dispatch }] = usePortkey();
  return useCallback(dispatch, [dispatch]);
}
