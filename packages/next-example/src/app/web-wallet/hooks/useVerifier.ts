import { useCallback, useEffect, useMemo, useState } from 'react';
import { did, ConfigProvider, IVerifier, useVerifyToken, ISocialLoginConfig } from '@portkey/did-ui-react';
import { AccountType, OperationTypeEnum, VerifierItem } from '@portkey/services';
import { ChainId } from '@portkey/provider-types';
import { zkLoginVerifierItem } from '@portkey/did-ui-react/src/constants/guardian';

interface IUseVerifier {
  getRecommendationVerifier: (chainId: ChainId) => Promise<IVerifier>;
  verifySocialToken: ({
    accountType,
    token,
    guardianIdentifier,
    verifier,
    chainId,
    operationType,
    operationDetails,
  }: {
    guardianIdentifier: string;
    accountType: AccountType;
    token?: string;
    verifier: IVerifier;
    chainId: ChainId;
    operationType: OperationTypeEnum;
    operationDetails: string;
    idToken?: string;
    nonce?: string;
    timestamp?: number;
  }) => any;
  verifierList: VerifierItem[];
  getVerifierList: (chainId: ChainId) => any;
}
const useVerifier: () => IUseVerifier = () => {
  const verifyToken = useVerifyToken();
  const [verifierList, setVerifierList] = useState<VerifierItem[]>([]);

  const socialLogin = useMemo<ISocialLoginConfig | undefined>(() => ConfigProvider.getSocialLoginConfig(), []);

  const getRecommendationVerifier: (chainId: ChainId) => Promise<IVerifier> = useCallback(
    async chainId =>
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
      operationDetails,
      idToken,
      nonce,
      timestamp,
    }: {
      guardianIdentifier: string;
      accountType: AccountType;
      token?: string;
      verifier: IVerifier;
      chainId: ChainId;
      operationType: OperationTypeEnum;
      operationDetails: string;
      idToken?: string;
      nonce?: string;
      timestamp?: number;
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
        case 'Telegram':
          accessToken = token;
          customLoginHandler = socialLogin?.Telegram?.customLoginHandler;
          break;
        default:
          throw 'accountType is not supported';
      }
      if (!verifier?.id) throw 'Verifier is not missing';
      return verifyToken(accountType, {
        accessToken,
        idToken,
        nonce,
        timestamp,
        id: guardianIdentifier,
        verifierId: verifier.id,
        chainId,
        clientId: clientId ?? '',
        redirectURI,
        operationType,
        operationDetails,
        customLoginHandler,
      });
    },
    [socialLogin, verifyToken],
  );

  const getVerifierList = useCallback(async (chainId: ChainId) => {
    if (!did.getVerifierServers) return;
    const result = await did.getVerifierServers(chainId);
    setVerifierList([...result, zkLoginVerifierItem]);
  }, []);

  return useMemo(
    () => ({ verifierList, getVerifierList, getRecommendationVerifier, verifySocialToken }),
    [getRecommendationVerifier, getVerifierList, verifierList, verifySocialToken],
  );
};

export default useVerifier;
