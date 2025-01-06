import { useCallback } from 'react';
import { useWebWallet } from '../index';

export function useWalletDispatch() {
  const [, { dispatch }] = useWebWallet();
  return useCallback(dispatch, [dispatch]);
}
