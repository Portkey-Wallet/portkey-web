import { Button } from 'antd';
import clsx from 'clsx';
import { useCallback, useRef, useEffect, useMemo } from 'react';
import { ISocialLogin, ISocialLoginConfig, OnErrorFunc, RegisterType, SocialLoginFinishHandler } from '../../types';
import { errorTip, handleErrorMessage, setLoading, socialLoginAuth } from '../../utils';
import CustomSvg from '../CustomSvg';
import { LoginFinishWithoutPin, Theme } from '../types';
import WakeUpPortkey from '../WakeUpPortkey';
import { devices } from '@portkey/utils';
import './index.less';
import singleMessage from '../CustomAnt/message';

interface SocialContentProps {
  type: RegisterType;
  theme?: Theme;
  socialLogin?: ISocialLoginConfig;
  isErrorTip?: boolean;
  networkType?: string;
  className?: string;
  onLoginByPortkey?: LoginFinishWithoutPin;
  onFinish?: SocialLoginFinishHandler;
  onError?: OnErrorFunc;
}

export default function SocialContent({
  type,
  theme,
  socialLogin,
  isErrorTip = true,
  networkType,
  className,
  onFinish,
  onLoginByPortkey,
  onError,
}: SocialContentProps) {
  const onFinishRef = useRef<SocialContentProps['onFinish']>(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  const login = useCallback(
    async (v: ISocialLogin) => {
      try {
        const result = await socialLogin?.[v]?.customLoginHandler?.();
        if (result?.error) throw result?.error;
        onFinishRef?.current?.({
          type: v,
          data: result?.data,
        });
      } catch (error) {
        const msg = handleErrorMessage(error);
        singleMessage.error(msg);
      }
    },
    [socialLogin],
  );

  const onGoogleSuccess = useCallback(async () => {
    setLoading(true);

    try {
      if (socialLogin?.Google?.customLoginHandler) return login('Google');
      setLoading(true);
      const response = await socialLoginAuth({
        type: 'Google',
        clientId: socialLogin?.Google?.clientId,
        redirectURI: socialLogin?.Google?.redirectURI,
      });
      setLoading(false);
      if (!response?.token) throw new Error('Google login failed');
      onFinishRef?.current?.({
        type: 'Google',
        data: { ...response, accessToken: response.token },
      });
    } catch (error) {
      errorTip(
        {
          errorFields: 'socialLogin Google',
          error: handleErrorMessage(error),
        },
        isErrorTip,
        onError,
      );
      setLoading(false);
    }
  }, [isErrorTip, login, onError, socialLogin?.Google]);

  const onAppleSuccess = useCallback(async () => {
    try {
      setLoading(true);

      if (socialLogin?.Apple?.customLoginHandler) return login('Apple');
      const res = await socialLoginAuth({
        type: 'Apple',
        clientId: socialLogin?.Apple?.clientId,
        redirectURI: socialLogin?.Apple?.redirectURI,
      });
      setLoading(false);
      if (res?.token) {
        onFinishRef?.current?.({
          type: 'Apple',
          data: { ...res, accessToken: res?.token },
        });
      }
    } catch (error) {
      errorTip(
        {
          errorFields: 'socialLogin Apple',
          error: handleErrorMessage(error),
        },
        isErrorTip,
        onError,
      );
      setLoading(false);
    }
  }, [isErrorTip, login, onError, socialLogin?.Apple]);

  const isMobile = useMemo(() => {
    try {
      return devices.isMobileDevices();
    } catch (error) {
      return false;
    }
  }, []);

  return (
    <div className={clsx('social-content-wrapper', className)}>
      {socialLogin?.Portkey && type !== 'Sign up' && isMobile && (
        <WakeUpPortkey
          type={type}
          networkType={networkType}
          websiteInfo={socialLogin?.Portkey}
          onFinish={onLoginByPortkey}
        />
      )}
      <Button className={clsx('social-login-btn')} onClick={onGoogleSuccess}>
        {theme === 'dark' ? <CustomSvg type="GuardianGoogle" /> : <CustomSvg type="Google" />}
        {`${type} with Google`}
      </Button>
      <Button className={clsx('social-login-btn')} onClick={onAppleSuccess}>
        {theme === 'dark' ? <CustomSvg type="GuardianApple" /> : <CustomSvg type="Apple" />}
        {`${type} with Apple`}
      </Button>
    </div>
  );
}
