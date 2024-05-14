import { ISocialLogin, ISocialLoginConfig, NetworkType } from '../types';
import { useCallback } from 'react';
import { socialLoginAuth } from '../utils';

export default function useSocialLogin({
  socialLogin,
  network,
}: {
  network?: NetworkType;
  socialLogin?: ISocialLoginConfig;
}) {
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

  const onSocialLogin = useCallback(
    async (type: ISocialLogin) => {
      if (socialLogin?.[type]?.customLoginHandler) return login(type);
      const response = await socialLoginAuth({
        type,
        clientId: socialLogin?.Google?.clientId,
        redirectURI: socialLogin?.Google?.redirectURI,
        network,
      });

      if (!response?.token) throw new Error(`${type} login failed`);
      return {
        type,
        data: { ...response, accessToken: response.token },
      };
    },
    [login, network, socialLogin],
  );

  return onSocialLogin;
}
