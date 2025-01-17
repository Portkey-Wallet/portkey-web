import { useCallback } from 'react';
import { useModal } from '.';

export function useModalDispatch() {
  const [, { dispatch }] = useModal();
  return useCallback(dispatch, [dispatch]);
}
