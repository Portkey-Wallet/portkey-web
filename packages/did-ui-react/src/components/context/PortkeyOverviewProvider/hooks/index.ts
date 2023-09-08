import { useCallback } from 'react';
import { usePortkeyOverview } from '../index';

export function usePortkeyOverviewDispatch() {
  const [, { dispatch }] = usePortkeyOverview();
  return useCallback(dispatch, [dispatch]);
}
