import { useCallback } from 'react';
import { usePortkeySend } from '../index';

export function usePortkeySendDispatch() {
  const [, { dispatch }] = usePortkeySend();
  return useCallback(dispatch, [dispatch]);
}
