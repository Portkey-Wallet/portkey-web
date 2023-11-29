import { AccountType, OperationTypeEnum } from '@portkey/services';
import { modalMethod, setLoading } from '../../../utils';
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
    }: {
      identifierInfo: IGuardianIdentifierInfo;
      accountType: AccountType;
      verifier: IVerifier;
    }) => {
      const identifier = identifierInfo.identifier;
      const isOk = await modalMethod({
        wrapClassName: 'verify-confirm-modal',
        type: 'confirm',
        content: (
          <p className="modal-content">
            {`${verifier.name ?? ''} will send a verification code to `}
            <span className="bold">{identifier}</span>
            {` to verify your ${accountType} address.`}
          </p>
        ),
      });
      if (isOk) {
        setLoading(true);
        const result = await sendVerifyCode({
          accountType,
          guardianIdentifier: identifier,
          verifier,
          chainId: identifierInfo.chainId,
          operationType: OperationTypeEnum.register,
        });
        setLoading(false);

        if (!result?.verifierSessionId) return;
        const verifyCodeInfo = {
          verifier,
          verifierSessionId: result.verifierSessionId,
        };
        return verifyCodeInfo;
      } else {
        // Cancel
      }
    },
    [sendVerifyCode],
  );
};

export default useSendCode;
