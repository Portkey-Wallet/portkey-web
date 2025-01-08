import { useCallback } from 'react';
import { did } from '@portkey/did';
import {
  getGoogleUserInfo,
  handleErrorCode,
  handleErrorMessage,
  parseAppleIdentityToken,
  parseFacebookToken,
  parseTelegramToken,
  parseTwitterToken,
} from '@portkey/utils';
import { message } from 'antd';
import { ISocialLogin } from '../context/types';
import { TSocialResponseData } from '../types/signIn';
export const useCheckIdentifier = () => {
  const validateIdentifier = useCallback(async (identifier?: string) => {
    try {
      const { originChainId } = await did.services.getRegisterInfo({
        loginGuardianIdentifier: identifier,
      });

      const payload = await did.getHolderInfo({
        loginGuardianIdentifier: identifier,
        chainId: originChainId,
      });

      return payload?.guardianList?.guardians?.length;
    } catch (error: any) {
      const errorCode = handleErrorCode(error);
      if (errorCode === '3002') {
        return 0;
      } else {
        throw handleErrorMessage(error || 'GetHolderInfo error');
      }
    }
  }, []);

  const onSocialFinish = useCallback(
    async ({ type, data }: { type: ISocialLogin; data: TSocialResponseData }) => {
      try {
        // setLoading(true, LoadingText.CheckingAccount);
        if (!data) throw 'Action error';

        let userId = undefined;
        if (type === 'Google') {
          const userInfo = await getGoogleUserInfo(data?.accessToken);
          userId = userInfo?.id;
          if (!userId) throw 'Authorization failed';
        } else if (type === 'Apple') {
          const userInfo = parseAppleIdentityToken(data?.accessToken);
          userId = userInfo?.userId;
          if (!userId) throw 'Authorization failed';
        } else if (type === 'Telegram') {
          const userInfo = parseTelegramToken(data?.accessToken);
          userId = userInfo?.userId;
          if (!userId) throw 'Authorization failed';
        } else if (type === 'Twitter') {
          const userInfo = parseTwitterToken(data?.accessToken);
          userId = userInfo?.userId;
          if (!userId) throw 'Authorization failed';
        } else if (type === 'Facebook') {
          const userInfo = await parseFacebookToken(data?.accessToken);
          userId = userInfo?.userId;
          if (!userId) throw 'Authorization failed';
        } else {
          throw Error(`AccountType:${type} is not support`);
        }

        return validateIdentifier(userId);
      } catch (error) {
        // setLoading(false);

        const msg = handleErrorMessage(error);
        message.error(msg);
      }
    },
    [validateIdentifier],
  );

  return onSocialFinish;
};
