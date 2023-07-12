import { useCallback } from 'react';
import { usePortkey } from './index';

export function usePortkeyDispatch() {
  const [, { dispatch }] = usePortkey();
  return useCallback(dispatch, [dispatch]);
}
