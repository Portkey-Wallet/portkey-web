import { Button, message } from 'antd';
import clsx from 'clsx';
import { useCallback, useRef, useEffect } from 'react';
import { ISocialLogin, ISocialLoginConfig, OnErrorFunc, RegisterType, SocialLoginFinishHandler } from '../../types';
import { appleAuthIdToken, errorTip, googleAuthAccessToken, handleErrorMessage, setLoading } from '../../utils';
import CustomSvg from '../CustomSvg';
import './index.less';

interface SocialContentProps {
  type: RegisterType;
  hasPortkey?: boolean;
  socialLogin?: ISocialLoginConfig;
  isErrorTip?: boolean;
  onFinish?: SocialLoginFinishHandler;
  onError?: OnErrorFunc;
}

export default function SocialContent({
  type,
  hasPortkey,
  socialLogin,
  isErrorTip,
  onFinish,
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
      if (!socialLogin?.Google) return;
      if (socialLogin?.Google?.customLoginHandler) return login('Google');
      const response = await googleAuthAccessToken({ ...socialLogin?.Google });
      if (!response?.accessToken) throw new Error('Google login failed');
      onFinishRef?.current?.({
        type: 'Google',
        data: { ...response, accessToken: response.accessToken },
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
    } finally {
      setLoading(false);
    }
  }, [isErrorTip, login, onError, socialLogin?.Google]);

  const onAppleSuccess = useCallback(async () => {
    setLoading(true);
    try {
      if (!socialLogin?.Apple) return;
      if (socialLogin?.Apple?.customLoginHandler) return login('Apple');
      const res = await appleAuthIdToken(socialLogin?.Apple);
      if (res?.identityToken) {
        onFinishRef?.current?.({
          type: 'Google',
          data: { ...res, accessToken: res?.identityToken },
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
    } finally {
      setLoading(false);
    }
  }, [isErrorTip, login, onError, socialLogin?.Apple]);

  const onPortkeySuccess = useCallback(async () => {
    //
    window.location.href = 'portkey.did://';
  }, []);

  return (
    <div className="social-content-wrapper">
      {hasPortkey && (
        <Button className={clsx('social-login-btn')} onClick={onPortkeySuccess}>
          <CustomSvg type="Portkey-login" />
          {`${type} with Portkey`}
        </Button>
      )}
      <Button
        className={clsx('social-login-btn', !socialLogin?.Google && 'social-login-disabled-button')}
        onClick={onGoogleSuccess}>
        <CustomSvg type="Google" />
        {`${type} with Google`}
      </Button>
      <Button
        className={clsx('social-login-btn', !socialLogin?.Google && 'social-login-disabled-button')}
        onClick={onAppleSuccess}>
        <CustomSvg type="Apple" />
        {`${type} with Apple`}
      </Button>
    </div>
  );
}
