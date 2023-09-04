import { useCallback, useEffect } from 'react';
import { SET_SERVICE_CONFIG } from '../../../../constants/events';
import { did, eventBus } from '../../../../utils';

export default function Init() {
  const setHandler = useCallback(() => {
    did.services.getChainsInfo();
  }, []);
  // Listen service change
  useEffect(() => {
    eventBus.addListener(SET_SERVICE_CONFIG, setHandler);
    return () => {
      eventBus.removeListener(SET_SERVICE_CONFIG, setHandler);
    };
  }, [setHandler]);

  return null;
}
