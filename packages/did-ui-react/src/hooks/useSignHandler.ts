import { ChainId } from '@portkey/types';
import { useRef, useCallback, useMemo } from 'react';
import { GuardianInputInfo, IBaseGetGuardianProps } from '../components';
import {
  did,
  getGoogleUserInfo,
  handleErrorCode,
  handleErrorMessage,
  parseAppleIdentityToken,
  parseFacebookToken,
  parseTelegramToken,
  parseTwitterToken,
  setLoading,
} from '../utils';
import { SocialLoginFinishHandler } from '../types';
import { useThrottleFirstCallback } from './throttle';

export const useSignHandler = ({
  defaultChainId,
  onError,
  onSuccess,
  customValidateEmail,
  customValidatePhone,
  onChainIdChange,
}: {
  defaultChainId: ChainId;
  onError: IBaseGetGuardianProps['onError'];
  onSuccess: IBaseGetGuardianProps['onSuccess'];
  customValidateEmail: IBaseGetGuardianProps['validateEmail'];
  customValidatePhone: IBaseGetGuardianProps['validatePhone'];
  onChainIdChange: IBaseGetGuardianProps['onChainIdChange'];
}) => {
  const isHasAccount = useRef<boolean>(false);
  const originChainIdRef = useRef<ChainId>('AELF');
  const caInfoRef = useRef({ caHash: '', caAddress: '' });

  const validateIdentifier = useCallback(async (identifier?: string): Promise<any> => {
    let isLoginGuardian = false;
    try {
      const { originChainId } = await did.services.getRegisterInfo({
        loginGuardianIdentifier: identifier,
      });
      originChainIdRef.current = originChainId;

      const payload = await did.getHolderInfo({
        loginGuardianIdentifier: identifier,
        chainId: originChainId,
      });
      caInfoRef.current = {
        caAddress: payload.caAddress,
        caHash: payload.caHash,
      };
      if (payload?.guardianList?.guardians?.length > 0) {
        isLoginGuardian = true;
      }
    } catch (error: any) {
      const errorCode = handleErrorCode(error);
      if (errorCode === '3002') {
        isLoginGuardian = false;
      } else {
        throw handleErrorMessage(error || 'GetHolderInfo error');
      }
    }

    isHasAccount.current = isLoginGuardian;
  }, []);

  const validateEmail = useCallback(
    async (email?: string) => {
      setLoading(true, 'Checking account info on the blockchain');
      await validateIdentifier(email);
      return customValidateEmail?.(email);
    },
    [customValidateEmail, validateIdentifier],
  );

  const validatePhone = useCallback(
    async (phone?: string) => {
      setLoading(true, 'Checking account info on the blockchain');
      await validateIdentifier(phone?.replaceAll(/\s/g, ''));
      return customValidatePhone?.(phone);
    },
    [customValidatePhone, validateIdentifier],
  );

  const getIdentifierChainId = useCallback(
    async (identifier: string) => {
      let _originChainId = defaultChainId;

      try {
        const { originChainId } = await did.services.getRegisterInfo({
          loginGuardianIdentifier: identifier.replaceAll(/\s/g, ''),
        });
        _originChainId = originChainId;
      } catch (error: any) {
        _originChainId = defaultChainId;
      }
      return _originChainId;
    },
    [defaultChainId],
  );

  const onFinish = useThrottleFirstCallback(
    async (value: GuardianInputInfo) => {
      onChainIdChange?.(originChainIdRef.current);
      onSuccess?.(
        { ...value, isLoginGuardian: isHasAccount.current, chainId: originChainIdRef.current },
        caInfoRef.current,
      );
    },
    [getIdentifierChainId, onChainIdChange, onSuccess],
  );

  const onSocialFinish: SocialLoginFinishHandler = useCallback(
    async ({ type, data }) => {
      try {
        setLoading(true, 'Checking account info on the blockchain');
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

        await validateIdentifier(userId);
        onFinish({
          identifier: userId,
          accountType: type,
          authenticationInfo: {
            authToken: data?.accessToken,
            idToken: data?.idToken,
            nonce: data?.nonce,
            timestamp: data?.timestamp,
          },
        });
      } catch (error) {
        setLoading(false);

        const msg = handleErrorMessage(error);
        onError?.({
          errorFields: 'onSocialFinish',
          error: msg,
        });
      }
    },
    [onError, onFinish, validateIdentifier],
  );

  return useMemo(
    () => ({ validateIdentifier, validateEmail, validatePhone, getIdentifierChainId, onFinish, onSocialFinish }),
    [validateIdentifier, validateEmail, validatePhone, getIdentifierChainId, onFinish, onSocialFinish],
  );
};
