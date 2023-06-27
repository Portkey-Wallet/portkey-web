import { Button, message } from 'antd';
import clsx from 'clsx';
import { useCallback, useRef, useEffect, useMemo } from 'react';
import { ISocialLogin, ISocialLoginConfig, OnErrorFunc, RegisterType, SocialLoginFinishHandler } from '../../types';
import { errorTip, handleErrorMessage, setLoading, socialLoginAuth } from '../../utils';
import { isMobileDevices } from '../../utils/isMobile';
import CustomSvg from '../CustomSvg';
import { LoginFinishWithoutPin } from '../types';
import WakeUpPortkey from '../WakeUpPortkey';
import './index.less';

interface SocialContentProps {
  type: RegisterType;
  socialLogin?: ISocialLoginConfig;
  isErrorTip?: boolean;
  networkType?: string;
  onLoginByPortkey?: LoginFinishWithoutPin;
  onFinish?: SocialLoginFinishHandler;
  onError?: OnErrorFunc;
}

export default function SocialContent({
  type,
  socialLogin,
  isErrorTip = true,
  networkType,
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
        message.error(msg);
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
      return isMobileDevices();
    } catch (error) {
      return false;
    }
  }, []);

  return (
    <div className="social-content-wrapper">
      {socialLogin?.Portkey && type !== 'Sign up' && isMobile && (
        <WakeUpPortkey
          type={type}
          networkType={networkType}
          websiteInfo={socialLogin?.Portkey}
          onFinish={onLoginByPortkey}
        />
      )}
      <Button className={clsx('social-login-btn')} onClick={onGoogleSuccess}>
        <CustomSvg type="Google" />
        {`${type} with Google`}
      </Button>
      <Button className={clsx('social-login-btn')} onClick={onAppleSuccess}>
        <CustomSvg type="Apple" />
        {`${type} with Apple`}
      </Button>
    </div>
  );
}
