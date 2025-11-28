import { useCallback } from 'react';
import { SET_SERVICE_CONFIG } from '../../../../constants/events';
import { did, eventBus } from '../../../../utils';
import { useThrottleFirstEffect } from '../../../../hooks/throttle';

export default function Init() {
  const setHandler = useCallback(() => {
    did.services.getChainsInfo();
  }, []);

  // Listen service change
  useThrottleFirstEffect(() => {
    eventBus.addListener(SET_SERVICE_CONFIG, setHandler);
    return () => {
      eventBus.removeListener(SET_SERVICE_CONFIG, setHandler);
    };
  }, [setHandler]);

  return null;
}
