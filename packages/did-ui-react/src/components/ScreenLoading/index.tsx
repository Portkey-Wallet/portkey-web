import { useEffect, useState, useCallback } from 'react';
import { eventBus } from '../../utils';
import { SET_GLOBAL_LOADING } from '../../constants/events';
import { LoadingInfo, LoadingInfoType, OpacityType } from '../../types';
import PortkeyLoading from '../PortkeyLoading';

interface ScreenLoadingInfo extends Partial<LoadingInfo> {
  loading: boolean | OpacityType;
}

export default function ScreenLoading() {
  const [loadingInfo, setLoading] = useState<ScreenLoadingInfo>();

  const setLoadingHandler = useCallback((loading: boolean | OpacityType, loadingInfo?: LoadingInfoType) => {
    let info;
    if (typeof loadingInfo === 'object') {
      info = loadingInfo;
    } else {
      loadingInfo ? (info = { text: loadingInfo }) : '';
    }
    setLoading({
      loading,
      ...info,
    });
  }, []);

  useEffect(() => {
    eventBus.addListener(SET_GLOBAL_LOADING, setLoadingHandler);
    return () => {
      eventBus.removeListener(SET_GLOBAL_LOADING, setLoadingHandler);
    };
  }, [setLoadingHandler]);

  const onCancel = useCallback(() => {
    setLoading({ loading: false });
  }, []);

  return (
    <PortkeyLoading
      loading={loadingInfo?.loading}
      loadingText={loadingInfo?.text}
      cancelable={loadingInfo?.cancelable}
      onCancel={onCancel}
    />
  );
}
