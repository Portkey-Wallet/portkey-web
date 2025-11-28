import { useState, useCallback, useEffect } from 'react';
import { BaseReCaptcha } from '../components/types';
import ConfigProvider from '../components/config-provider';
import { eventBus } from '../utils';
import { SET_RECAPTCHA_CONFIG } from '../constants/events';

const useReCaptcha = () => {
  const [reCaptchaInfo, setReCaptchaInfo] = useState<Partial<BaseReCaptcha> | undefined>(
    ConfigProvider.config?.reCaptchaConfig,
  );
  const setHandler = useCallback((_reCaptchaInfo: Partial<BaseReCaptcha>) => {
    setReCaptchaInfo((v) => ({ ...v, ..._reCaptchaInfo }));
  }, []);

  useEffect(() => {
    eventBus.addListener(SET_RECAPTCHA_CONFIG, setHandler);
    return () => {
      eventBus.removeListener(SET_RECAPTCHA_CONFIG, setHandler);
    };
  }, [setHandler]);

  return reCaptchaInfo;
};

export default useReCaptcha;
