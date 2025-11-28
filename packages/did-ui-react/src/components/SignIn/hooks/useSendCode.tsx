import { AccountType, OperationTypeEnum } from '@portkey/services';
import { useCallback } from 'react';
import { IGuardianIdentifierInfo, IVerifier } from '../../types';
import useVerifier from '../../../hooks/useVerifier';

const useSendCode = () => {
  const { sendVerifyCode } = useVerifier();
  /**
   * @returns When the user cancels or human-computer verification fails, undefined is returned.
   */
  return useCallback(
    async ({
      identifierInfo,
      accountType,
      verifier,
      operationType = OperationTypeEnum.register,
    }: {
      identifierInfo: IGuardianIdentifierInfo;
      accountType: AccountType;
      verifier: IVerifier;
      operationType?: OperationTypeEnum;
    }) => {
      const identifier = identifierInfo.identifier;
      const result = await sendVerifyCode({
        accountType,
        guardianIdentifier: identifier,
        verifier,
        chainId: identifierInfo.chainId,
        operationType,
      });

      if (!result?.verifierSessionId) return;
      const verifyCodeInfo = {
        verifier,
        verifierSessionId: result.verifierSessionId,
      };
      return verifyCodeInfo;
    },
    [sendVerifyCode],
  );
};

export default useSendCode;
