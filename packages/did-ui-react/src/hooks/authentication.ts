import { useCallback } from 'react';
import { ISocialLogin, NetworkType, VerifyTokenParams } from '../types';
import {
  did,
  getGoogleUserInfo,
  parseAppleIdentityToken,
  parseFacebookToken,
  parseTelegramToken,
  parseTwitterToken,
  socialLoginAuth,
} from '../utils';
import { OperationTypeEnum } from '@portkey/services';
import type { ChainId, TStringJSON } from '@portkey/types';

interface VerifySocialLoginParams extends VerifyTokenParams, BaseAuthProps {
  operationType: OperationTypeEnum;
  targetChainId?: ChainId;
  networkType?: NetworkType;
  operationDetails: TStringJSON;
}

interface BaseAuthProps {
  clientId?: string;
  redirectURI?: string; // when apple login, it will be used
}

export function useVerifyGoogleToken() {
  return useCallback(async (params: VerifySocialLoginParams) => {
    let accessToken = params.accessToken;
    let isRequest = !accessToken;
    if (accessToken) {
      try {
        const { id } = await getGoogleUserInfo(accessToken);
        if (!id) isRequest = true;
      } catch (error) {
        isRequest = true;
      }
    } else {
      isRequest = true;
    }
    if (isRequest) {
      let googleInfo;
      if (params?.customLoginHandler) {
        const result = await params?.customLoginHandler();
        if (result.error) throw result.error;
        googleInfo = result.data;
      } else {
        googleInfo = await socialLoginAuth({
          type: 'Google',
          clientId: params.clientId,
          redirectURI: params.redirectURI,
        });
      }
      const _token = googleInfo?.token || (googleInfo as any)?.accessToken;
      if (!_token) throw new Error('Can not get accessToken');
      accessToken = _token;
      const { id } = await getGoogleUserInfo(accessToken as string);
      if (id !== params.id) throw new Error('Account does not match your guardian');
    }
    if (!accessToken) throw new Error('accessToken is not defined');

    return did.services.verifyGoogleToken({
      verifierId: params.verifierId,
      chainId: params.chainId,
      accessToken,
      operationType: params.operationType,
      targetChainId: params.targetChainId,
      operationDetails: params.operationDetails,
    });
  }, []);
}

export function useVerifyAppleToken() {
  return useCallback(async (params: VerifySocialLoginParams) => {
    let accessToken = params.accessToken;
    const { isExpired: tokenIsExpired } = parseAppleIdentityToken(accessToken) || {};
    if (!accessToken || tokenIsExpired) {
      if (params?.customLoginHandler) {
        const result = await params?.customLoginHandler();
        if (result.error) throw result.error;
        accessToken = result.data?.accessToken;
      } else {
        const authRes: any = await socialLoginAuth({
          type: 'Apple',
          clientId: params.clientId,
          redirectURI: params.redirectURI,
        });
        if (!authRes) throw new Error('Missing Response');
        accessToken = authRes?.token;
      }
    }
    if (!accessToken) throw new Error('accessToken is not defined');
    const { userId } = parseAppleIdentityToken(accessToken) || {};
    if (userId !== params.id) throw new Error('Account does not match your guardian');
    return did.services.verifyAppleToken({
      verifierId: params.verifierId,
      chainId: params.chainId,
      identityToken: accessToken,
      operationType: params.operationType,
      targetChainId: params.targetChainId,
      operationDetails: params.operationDetails,
    });
  }, []);
}

export function useVerifyTelegram() {
  return useCallback(async (params: VerifySocialLoginParams) => {
    let accessToken = params.accessToken;
    const { isExpired: tokenIsExpired } = parseTelegramToken(accessToken) || {};
    if (!accessToken || tokenIsExpired) {
      if (params?.customLoginHandler) {
        const result = await params?.customLoginHandler();
        if (result.error) throw result.error;
        accessToken = result.data?.accessToken;
      } else {
        const authRes: any = await socialLoginAuth({
          type: 'Telegram',
          network: params.networkType,
        });
        if (!authRes) throw new Error('Missing Response');
        accessToken = authRes?.token;
      }
    }
    if (!accessToken) throw new Error('accessToken is not defined');
    const { userId } = parseTelegramToken(accessToken) || {};
    if (userId !== params.id) throw new Error('Account does not match your guardian');
    return did.services.verifyTelegramToken({
      verifierId: params.verifierId,
      chainId: params.chainId,
      accessToken,
      operationType: params.operationType,
      targetChainId: params.targetChainId,
      operationDetails: params.operationDetails,
    });
  }, []);
}

export function useVerifyFacebook() {
  return useCallback(async (params: VerifySocialLoginParams) => {
    let tokenInfo = params.accessToken;
    const { isExpired: tokenIsExpired, accessToken: token } = (await parseFacebookToken(tokenInfo)) || {};
    if (!token || tokenIsExpired) {
      if (params?.customLoginHandler) {
        const result = await params?.customLoginHandler();
        if (result.error) throw result.error;
        tokenInfo = result.data?.accessToken;
      } else {
        const authRes: any = await socialLoginAuth({
          type: 'Facebook',
          network: params.networkType,
        });
        if (!authRes) throw new Error('Missing Response');
        tokenInfo = authRes?.token;
      }
    }
    const { userId, accessToken } = (await parseFacebookToken(tokenInfo)) || {};
    if (!tokenInfo || !accessToken) throw new Error('accessToken is not defined');
    if (userId !== params.id) throw new Error('Account does not match your guardian');

    return did.services.verifyFacebookToken({
      verifierId: params.verifierId,
      chainId: params.chainId,
      accessToken,
      operationType: params.operationType,
      targetChainId: params.targetChainId,
      operationDetails: params.operationDetails,
    });
  }, []);
}

export function useVerifyTwitter() {
  return useCallback(async (params: VerifySocialLoginParams) => {
    let tokenInfo = params.accessToken;
    const { isExpired: tokenIsExpired, accessToken: token } = parseTwitterToken(tokenInfo) || {};
    if (!token || tokenIsExpired) {
      if (params?.customLoginHandler) {
        const result = await params?.customLoginHandler();
        if (result.error) throw result.error;
        tokenInfo = result.data?.accessToken;
      } else {
        const authRes: any = await socialLoginAuth({
          type: 'Twitter',
          network: params.networkType,
        });
        if (!authRes) throw new Error('Missing Response');
        tokenInfo = authRes?.token;
      }
    }
    const { userId, accessToken } = parseTwitterToken(tokenInfo) || {};
    if (!tokenInfo || !accessToken) throw new Error('accessToken is not defined');
    if (userId !== params.id) throw new Error('Account does not match your guardian');

    return did.services.verifyTwitterToken(
      {
        verifierId: params.verifierId,
        chainId: params.chainId,
        accessToken,
        operationType: params.operationType,
        targetChainId: params.targetChainId,
        operationDetails: params.operationDetails,
      },
      { 'oauth-version': '1.0A' },
    );
  }, []);
}

export function useVerifyToken() {
  const verifyGoogleToken = useVerifyGoogleToken();
  const verifyAppleToken = useVerifyAppleToken();
  const verifyTelegram = useVerifyTelegram();
  const verifyFacebook = useVerifyFacebook();
  const verifyTwitter = useVerifyTwitter();

  return useCallback(
    (type: ISocialLogin, params: VerifySocialLoginParams) => {
      let func = verifyAppleToken;
      if (type === 'Apple') {
        func = verifyAppleToken;
      } else if (type === 'Google') {
        func = verifyGoogleToken;
      } else if (type === 'Telegram') {
        func = verifyTelegram;
      } else if (type === 'Facebook') {
        func = verifyFacebook;
      } else if (type === 'Twitter') {
        func = verifyTwitter;
      }
      return func(params);
    },
    [verifyAppleToken, verifyFacebook, verifyGoogleToken, verifyTelegram, verifyTwitter],
  );
}
