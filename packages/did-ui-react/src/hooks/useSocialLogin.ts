import { ISocialLogin, ISocialLoginConfig, TSocialResponseData } from '../types';
import { useCallback, useMemo } from 'react';
import { socialLoginAuth } from '../utils';

type TLoginFunction = () => Promise<{ type: ISocialLogin; data?: TSocialResponseData }>;

export default function useSocialLogin({ socialLogin }: { socialLogin?: ISocialLoginConfig }) {
  const login = useCallback(
    async (v: ISocialLogin) => {
      const result = await socialLogin?.[v]?.customLoginHandler?.();
      if (result?.error) throw result?.error;
      return {
        type: v,
        data: result?.data,
      };
    },
    [socialLogin],
  );
  const loginByGoogle: TLoginFunction = useCallback(async () => {
    if (socialLogin?.Google?.customLoginHandler) return login('Google');
    const response = await socialLoginAuth({
      type: 'Google',
      clientId: socialLogin?.Google?.clientId,
      redirectURI: socialLogin?.Google?.redirectURI,
    });
    if (!response?.token) throw new Error('Google login failed');
    return {
      type: 'Google',
      data: { ...response, accessToken: response.token },
    };
  }, [login, socialLogin?.Google]);

  const loginByApple: TLoginFunction = useCallback(async () => {
    if (socialLogin?.Apple?.customLoginHandler) return login('Apple');
    const res = await socialLoginAuth({
      type: 'Apple',
      clientId: socialLogin?.Apple?.clientId,
      redirectURI: socialLogin?.Apple?.redirectURI,
    });
    if (!res?.token) throw 'Apple login failed (token not found)';
    return {
      type: 'Apple',
      data: { ...res, accessToken: res?.token },
    };
  }, [login, socialLogin?.Apple]);

  return useMemo(() => ({ loginByGoogle, loginByApple }), [loginByApple, loginByGoogle]);
}
