import { useEffect, useState, useCallback } from 'react';
import { eventBus, setLoading } from '../../utils';
import { SET_GLOBAL_LOADING } from '../../constants/events';
import { LoadingInfo, LoadingInfoType, OpacityType, ScreenLoadingInfo } from '../../types';
import PortkeyLoading from '../PortkeyLoading';
import ConfigProvider from '../config-provider';

export default function ScreenLoading() {
  const [loadingInfo, setLoadingInfo] = useState<ScreenLoadingInfo>();

  const setLoadingHandler = useCallback((loading: boolean | OpacityType, loadingInfo?: LoadingInfoType) => {
    let info: LoadingInfo = {};
    if (typeof loadingInfo === 'object') {
      info = loadingInfo;
    } else {
      loadingInfo ? (info = { text: loadingInfo }) : '';
    }
    const _loadingInfo: ScreenLoadingInfo = {
      loading,
      ...info,
      onCancel: () => {
        setLoading(false);
        info?.onCancel?.();
      },
    };
    const loadingHandler = ConfigProvider.config.globalLoadingHandler;
    if (loadingHandler) return loadingHandler.onSetLoading(_loadingInfo);
    setLoadingInfo(_loadingInfo);
  }, []);

  useEffect(() => {
    eventBus.addListener(SET_GLOBAL_LOADING, setLoadingHandler);
    return () => {
      eventBus.removeListener(SET_GLOBAL_LOADING, setLoadingHandler);
    };
  }, [setLoadingHandler]);

  return (
    <PortkeyLoading
      loading={loadingInfo?.loading}
      loadingText={loadingInfo?.text}
      cancelable={loadingInfo?.cancelable}
      onCancel={loadingInfo?.onCancel}
    />
  );
}
