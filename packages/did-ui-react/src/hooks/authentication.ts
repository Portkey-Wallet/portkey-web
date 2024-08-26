import { useCallback } from 'react';
import { IApproveDetail, ISocialLogin, NetworkType, VerifyTokenParams } from '../types';
import {
  did,
  getGoogleUserInfo,
  parseAppleIdentityToken,
  parseFacebookToken,
  parseKidFromJWTToken,
  parseTelegramToken,
  parseTwitterToken,
  randomId,
  socialLoginAuth,
} from '../utils';
import { OperationTypeEnum, VerifyVerificationCodeResult, VerifyZKLoginParams, ZKLoginInfo } from '@portkey/services';
import type { ChainId, TStringJSON } from '@portkey/types';
import { FetchRequest } from '@portkey/request';
import { VerifyTypeEnum } from '../constants/guardian';

interface VerifySocialLoginParams extends VerifyTokenParams, BaseAuthProps {
  operationType: OperationTypeEnum;
  targetChainId?: ChainId;
  networkType?: NetworkType;
  operationDetails: TStringJSON;
  approveDetail?: IApproveDetail;
  idToken?: string;
  nonce?: string;
  timestamp?: number;
  salt?: string;
}

interface BaseAuthProps {
  clientId?: string;
  redirectURI?: string; // when apple login, it will be used
}

export function useVerifyGoogleToken() {
  const verifyZKLogin = useVerifyZKLogin();
  return useCallback(
    async (params: VerifySocialLoginParams) => {
      console.log('aaaa useVerifyGoogleToken params', params);
      let accessToken = params.accessToken;
      let isRequest = !accessToken;
      let idToken = params.idToken;
      console.log('aaaa useVerifyGoogleToken idToken', idToken);
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
      console.log('aaaa useVerifyGoogleToken after idToken', idToken);
      if (!idToken) {
        throw new Error('Invalid idToken 1');
      }
      const rst = await verifyZKLogin({
        verifyToken: {
          type: 'Google',
          accessToken,
          verifierId: params.verifierId,
          chainId: params.chainId,
          operationType: params.operationType,
        },
        jwt: idToken,
        salt: params.salt ? params.salt : randomId(),
        kid: parseKidFromJWTToken(idToken),
        nonce,
        timestamp: timestamp ?? 0,
        managerAddress,
      });
      return rst as any;
    },
    [verifyZKLogin],
  );
}

export function useVerifyAppleToken() {
  const verifyZKLogin = useVerifyZKLogin();
  return useCallback(
    async (params: VerifySocialLoginParams) => {
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
          idToken = result.data?.token;
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
      const rst = await verifyZKLogin({
        verifyToken: {
          type: 'Apple',
          accessToken,
          verifierId: params.verifierId,
          chainId: params.chainId,
          operationType: params.operationType,
        },
        jwt: idToken,
        salt: params.salt ? params.salt : randomId(),
        kid: parseKidFromJWTToken(idToken),
        nonce,
        timestamp: timestamp ?? 0,
        managerAddress,
      });
      return rst as any;
    },
    [verifyZKLogin],
  );
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
          approveDetail: params.approveDetail,
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
          approveDetail: params.approveDetail,
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

export function useVerifyZKLogin() {
  // TODO-SA
  const zkLoginVerifyUrl = 'https://zklogin-prover-test.portkey.finance/v1/prove';
  return useCallback(async (params: VerifyZKLoginParams) => {
    const customFetch = new FetchRequest({});
    const { verifyToken, jwt, salt, kid, nonce, timestamp, managerAddress } = params;
    const proofParams = { jwt, salt };
    console.log('🌹🌹🌹useVerifyZKLogin params: ', proofParams);
    const proofResult = await customFetch.send({
      url: zkLoginVerifyUrl,
      method: 'POST',
      headers: {
        Accept: 'text/plain;v=1.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proofParams),
    });

    const verifyParams = {
      identifierHash: proofResult.identifierHash,
      salt,
      nonce,
      kid,
      proof: proofResult.proof,
    };

    const portkeyVerifyResult = await did.services.verifyZKLogin({
      ...verifyToken,
      poseidonIdentifierHash: proofResult.identifierHash,
      salt,
    });

    console.log('portkeyVerifyResult : ', portkeyVerifyResult);

    const zkProof = decodeURIComponent(verifyParams.proof);
    const zkLoginInfo: ZKLoginInfo = {
      identifierHash: portkeyVerifyResult.guardianIdentifierHash,
      poseidonIdentifierHash: verifyParams.identifierHash,
      identifierHashType: 1,
      salt: verifyParams.salt,
      zkProof,
      jwt: jwt ?? '',
      nonce: nonce ?? '',
      circuitId: proofResult.circuitId,
      timestamp,
      managerAddress,
    };
    return { zkLoginInfo };
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
      let func: (params: VerifySocialLoginParams) => Promise<VerifyVerificationCodeResult | undefined> =
        verifyAppleToken;
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
      return func?.(params);
    },
    [verifyAppleToken, verifyFacebook, verifyGoogleToken, verifyTelegram, verifyTwitter],
  );
}
