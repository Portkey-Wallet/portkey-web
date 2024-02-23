import { useCallback, useMemo } from 'react';
import { did, verification } from '../utils';
import { ChainId, TStringJSON } from '@portkey/types';
import { AccountType, OperationTypeEnum } from '@portkey/services';
import { useVerifyToken } from './authentication';
import { ISocialLogin, NetworkType } from '../types';
import { IVerifier } from '../components';
import useReCaptchaModal from './useReCaptchaModal';
import { getSocialConfig } from '../components/utils/social.utils';

const useVerifier = () => {
  const verifyToken = useVerifyToken();
  const reCaptchaHandler = useReCaptchaModal();

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
      networkType,
      operationDetails,
    }: {
      guardianIdentifier: string;
      accountType: AccountType;
      token?: string;
      verifier: IVerifier;
      chainId: ChainId;
      networkType?: NetworkType;
      operationType: OperationTypeEnum;
      operationDetails: TStringJSON;
    }) => {
      const _accountType = accountType as ISocialLogin;
      const { clientId, redirectURI, customLoginHandler } = getSocialConfig(_accountType);

      if (!verifier?.id) throw 'Verifier is not missing';
      return verifyToken(_accountType, {
        accessToken: token,
        id: guardianIdentifier,
        verifierId: verifier.id,
        chainId,
        clientId: clientId ?? '',
        redirectURI,
        operationType,
        networkType,
        operationDetails,
        customLoginHandler,
      });
    },
    [verifyToken],
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
