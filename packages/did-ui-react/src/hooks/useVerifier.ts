import { useCallback, useMemo } from 'react';
import { did, verification } from '../utils';
import { ChainId } from '@portkey/types';
import { AccountType, OperationTypeEnum } from '@portkey/services';
import { useVerifyToken } from './authentication';
import { ISocialLoginConfig } from '../types';
import ConfigProvider from '../components/config-provider';
import { IVerifier } from '../components';
import useReCaptchaModal from './useReCaptchaModal';

const useVerifier = () => {
  const verifyToken = useVerifyToken();
  const reCaptchaHandler = useReCaptchaModal();

  const socialLogin = useMemo<ISocialLoginConfig | undefined>(() => ConfigProvider.getSocialLoginConfig(), []);

  const getRecommendationVerifier: (chainId: ChainId) => Promise<IVerifier> = useCallback(
    async (chainId) =>
      did.services.getRecommendationVerifier({
        chainId,
      }),
    [],
  );

  const verifySocialToken = useCallback(
    async ({
      accountType,
      token,
      guardianIdentifier,
      verifier,
      chainId,
      operationType,
    }: {
      guardianIdentifier: string;
      accountType: AccountType;
      token?: string;
      verifier: IVerifier;
      chainId: ChainId;
      operationType: OperationTypeEnum;
    }) => {
      let accessToken;
      let clientId;
      let redirectURI;
      let customLoginHandler;
      switch (accountType) {
        case 'Apple':
          accessToken = token;
          clientId = socialLogin?.Apple?.clientId;
          redirectURI = socialLogin?.Apple?.redirectURI;
          customLoginHandler = socialLogin?.Apple?.customLoginHandler;
          break;
        case 'Google':
          accessToken = token;
          clientId = socialLogin?.Google?.clientId;
          customLoginHandler = socialLogin?.Google?.customLoginHandler;
          break;
        default:
          throw 'accountType is not supported';
      }
      if (!verifier?.id) throw 'Verifier is not missing';
      return verifyToken(accountType, {
        accessToken,
        id: guardianIdentifier,
        verifierId: verifier.id,
        chainId,
        clientId: clientId ?? '',
        redirectURI,
        operationType,
        customLoginHandler,
      });
    },
    [socialLogin, verifyToken],
  );

  const sendVerifyCode = useCallback(
    async ({
      accountType,
      guardianIdentifier,
      verifier,
      chainId,
      operationType,
    }: {
      guardianIdentifier: string;
      accountType: AccountType;
      verifier: IVerifier;
      chainId: ChainId;
      operationType: OperationTypeEnum;
    }) => {
      const result = await verification.sendVerificationCode(
        {
          params: {
            type: accountType,
            guardianIdentifier: guardianIdentifier.replaceAll(/\s+/g, ''),
            verifierId: verifier.id,
            chainId,
            operationType,
          },
        },
        reCaptchaHandler,
      );

      if (result.verifierSessionId) {
        return result;
      } else {
        console.error('sendVerificationCode params error');
      }
    },
    [reCaptchaHandler],
  );

  return useMemo(
    () => ({ getRecommendationVerifier, verifySocialToken, sendVerifyCode }),
    [getRecommendationVerifier, verifySocialToken, sendVerifyCode],
  );
};

export default useVerifier;
