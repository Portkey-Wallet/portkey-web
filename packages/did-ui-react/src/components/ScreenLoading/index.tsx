import { useEffect, useState, useCallback } from 'react';
import { eventBus } from '../../utils';
import { SET_GLOBAL_LOADING } from '../../constants/events';
import { OpacityType } from '../../types';
import PortkeyLoading from '../PortkeyLoading';

interface LoadingInfo {
  loading: boolean | OpacityType;
  loadingText?: string;
}

export default function ScreenLoading() {
  const [loadingInfo, setLoading] = useState<LoadingInfo>();

  const setLoadingHandler = useCallback(
    (loading: boolean | OpacityType, loadingText?: string) =>
      setLoading({
        loading,
        loadingText,
      }),
    [],
  );

  useEffect(() => {
    eventBus.addListener(SET_GLOBAL_LOADING, setLoadingHandler);
    return () => {
      eventBus.removeListener(SET_GLOBAL_LOADING, setLoadingHandler);
    };
  }, [setLoadingHandler]);

  return <PortkeyLoading {...loadingInfo} />;
}
