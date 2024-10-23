import { useCallback } from 'react';
import { IApproveDetail, ISocialLogin, NetworkType, VerifyTokenParams } from '../types';
import {
  getGoogleUserInfo,
  parseAppleIdentityToken,
  parseFacebookToken,
  parseKidFromJWTToken,
  parseTelegramToken,
  parseTwitterToken,
  randomId,
  socialLoginAuth,
} from '../utils';
import { OperationTypeEnum } from '@portkey/services';
import type { ChainId, TStringJSON } from '@portkey/types';
import { usePortkeyAsset } from '../components';

export interface VerifySocialLoginParams extends VerifyTokenParams, BaseAuthProps {
  operationType: OperationTypeEnum;
  targetChainId?: ChainId;
  networkType?: NetworkType;
  operationDetails: TStringJSON;
  approveDetail?: IApproveDetail;
  caHash?: string;
  idToken?: string;
  nonce?: string;
  timestamp?: number;
  salt?: string;
}

interface BaseAuthProps {
  clientId?: string;
  redirectURI?: string; // when apple login, it will be used
}

export function useAsyncVerifyGoogleToken() {
  return useCallback(async (params: VerifySocialLoginParams) => {
    let accessToken = params.accessToken;
    let isRequest = !accessToken;
    let idToken = params.idToken;
    let nonce = params.nonce;
    let timestamp = params.timestamp;
    const managerAddress = params.operationDetails ? JSON.parse(params.operationDetails).manager : '';
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
          network: params.networkType,
          approveDetail: params.approveDetail,
          managerAddress: managerAddress,
        });
      }
      idToken = googleInfo?.idToken;
      nonce = googleInfo?.nonce;
      timestamp = googleInfo?.timestamp;
      const _token = googleInfo?.token || (googleInfo as any)?.accessToken;
      if (!_token) throw new Error('Can not get accessToken');
      accessToken = _token;
      const { id } = await getGoogleUserInfo(accessToken as string);
      if (id !== params.id) throw new Error('Account does not match your guardian');
    }
    if (!accessToken) throw new Error('accessToken is not defined');
    if (!idToken) {
      throw new Error('Invalid idToken');
    }
    return {
      ...params,
      accessToken,
      idToken: idToken,
      salt: params.salt ? params.salt : randomId(),
      kid: parseKidFromJWTToken(idToken),
      nonce,
      timestamp: timestamp ?? 0,
      managerAddress,
    };
  }, []);
}

export function useAsyncVerifyAppleToken() {
  return useCallback(async (params: VerifySocialLoginParams) => {
    let accessToken = params.accessToken;
    let idToken = params.idToken;
    let nonce = params.nonce;
    let timestamp = params.timestamp;
    const managerAddress = params.operationDetails ? JSON.parse(params.operationDetails).manager : '';
    const { isExpired: tokenIsExpired } = parseAppleIdentityToken(accessToken) || {};
    if (!accessToken || tokenIsExpired) {
      if (params?.customLoginHandler) {
        const result = await params?.customLoginHandler();
        if (result.error) throw result.error;
        accessToken = result.data?.accessToken;
        idToken = result.data?.idToken;
        nonce = result.data?.nonce;
        timestamp = result.data?.timestamp;
      } else {
        const authRes: any = await socialLoginAuth({
          type: 'Apple',
          clientId: params.clientId,
          redirectURI: params.redirectURI,
          network: params.networkType,
          approveDetail: params.approveDetail,
          managerAddress: managerAddress,
        });
        if (!authRes) throw new Error('Missing Response');
        accessToken = authRes?.token;
        idToken = authRes?.idToken;
        nonce = authRes?.nonce;
        timestamp = authRes?.timestamp;
      }
    }
    if (!accessToken) throw new Error('accessToken is not defined');
    const { userId } = parseAppleIdentityToken(accessToken) || {};
    if (userId !== params.id) throw new Error('Account does not match your guardian');
    if (!idToken) {
      throw new Error('Invalid idToken');
    }
    return {
      ...params,
      accessToken,
      jwt: idToken,
      salt: params.salt ? params.salt : randomId(),
      kid: parseKidFromJWTToken(idToken),
      nonce,
      timestamp: timestamp ?? 0,
      managerAddress,
    };
  }, []);
}

export function useAsyncVerifyTelegram() {
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
          guardianIdentifier: params.id,
          approveDetail: params.approveDetail,
        });
        if (!authRes) throw new Error('Missing Response');
        accessToken = authRes?.token;
      }
    }
    if (!accessToken) throw new Error('accessToken is not defined');
    const { userId } = parseTelegramToken(accessToken) || {};
    if (userId !== params.id) throw new Error('Account does not match your guardian');
    return {
      ...params,
      accessToken,
    };
  }, []);
}

export function useAsyncVerifyFacebook() {
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
          approveDetail: params.approveDetail,
        });
        if (!authRes) throw new Error('Missing Response');
        tokenInfo = authRes?.token;
      }
    }
    const { userId, accessToken } = (await parseFacebookToken(tokenInfo)) || {};
    if (!tokenInfo || !accessToken) throw new Error('accessToken is not defined');
    if (userId !== params.id) throw new Error('Account does not match your guardian');
    return {
      ...params,
      accessToken,
    };
  }, []);
}

export function useAsyncVerifyTwitter() {
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
          approveDetail: params.approveDetail,
        });
        if (!authRes) throw new Error('Missing Response');
        tokenInfo = authRes?.token;
      }
    }
    const { userId, accessToken } = parseTwitterToken(tokenInfo) || {};
    if (!tokenInfo || !accessToken) throw new Error('accessToken is not defined');
    if (userId !== params.id) throw new Error('Account does not match your guardian');

    return {
      ...params,
      accessToken,
    };
  }, []);
}

export function useAsyncVerifyToken() {
  const verifyGoogleToken = useAsyncVerifyGoogleToken();
  const verifyAppleToken = useAsyncVerifyAppleToken();
  const verifyTelegram = useAsyncVerifyTelegram();
  const verifyFacebook = useAsyncVerifyFacebook();
  const verifyTwitter = useAsyncVerifyTwitter();
  const assets = usePortkeyAsset();

  return useCallback(
    (type: ISocialLogin, params: VerifySocialLoginParams, isAsyncVerify = false) => {
      let func: (params: VerifySocialLoginParams, isAsyncVerify: boolean) => Promise<any> = verifyAppleToken;
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
      const paramsWithCaHash = { caHash: assets?.[0]?.caHash || '', ...params };

      return func?.(paramsWithCaHash, isAsyncVerify);
    },
    [assets, verifyAppleToken, verifyFacebook, verifyGoogleToken, verifyTelegram, verifyTwitter],
  );
}
