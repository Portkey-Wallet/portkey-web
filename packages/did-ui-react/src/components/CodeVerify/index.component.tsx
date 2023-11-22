import { useCallback, useState, useRef } from 'react';
import { errorTip, verifyErrorHandler, setLoading, handleErrorMessage, verification } from '../../utils';
import type { ChainId } from '@portkey/types';
import { OperationTypeEnum } from '@portkey/services';
import { TVerifyCodeInfo } from '../SignStep/types';
import useReCaptchaModal from '../../hooks/useReCaptchaModal';
import CodeVerifyUI, { ICodeVerifyUIInterface } from '../CodeVerifyUI';
import { BaseCodeVerifyProps } from '../types';
import './index.less';
import { sleep } from '@portkey/utils';
import useMobile from '../../hooks/useMobile';

const MAX_TIMER = 60;

export interface CodeVerifyProps extends BaseCodeVerifyProps {
  chainId: ChainId;
  verifierSessionId: string;
  isErrorTip?: boolean;
  operationType: OperationTypeEnum;
  onSuccess?: (res: { verificationDoc: string; signature: string; verifierId: string }) => void;
  onReSend?: (result: TVerifyCodeInfo) => void;
}

export default function CodeVerify({
  chainId,
  verifier,
  className,
  tipExtra,
  isErrorTip = true,
  operationType,
  isCountdownNow,
  isLoginGuardian,
  guardianIdentifier,
  accountType = 'Email',
  verifierSessionId: defaultVerifierSessionId,
  onError,
  onReSend,
  onSuccess,
}: CodeVerifyProps) {
  const [pinVal, setPinVal] = useState<string>();
  const [verifierSessionId, setVerifierSessionId] = useState<string>(defaultVerifierSessionId);
  const uiRef = useRef<ICodeVerifyUIInterface>();
  const [codeError, setCodeError] = useState<boolean>();
  const isMobile = useMobile();

  const setInputError = useCallback(async (isError?: boolean) => {
    if (!isError) return setCodeError(isError);
    setCodeError(true);
    await sleep(1000);
    setCodeError(false);
  }, []);

  const onFinish = useCallback(
    async (code: string) => {
      try {
        if (code && code.length === 6) {
          if (!verifierSessionId) throw Error(`VerifierSessionId(${verifierSessionId}) is invalid`);
          setLoading(true);
          const result = await verification.checkVerificationCode({
            verifierSessionId,
            verificationCode: code,
            guardianIdentifier: guardianIdentifier.replaceAll(/\s+/g, ''),
            verifierId: verifier.id,
            chainId,
            operationType,
          });
          setLoading(false);
          console.log(result, 'verifyErrorHandler==');

          if (result.signature) return onSuccess?.({ ...result, verifierId: verifier?.id || '' });
          setPinVal('');
        } else {
          throw Error('Please check if the PIN code is entered correctly');
        }
      } catch (error: any) {
        setLoading(false);
        setPinVal('');
        console.log(error, 'error==verifyErrorHandler=');
        const _error = verifyErrorHandler(error);
        console.log(error, _error, 'error==verifyErrorHandler=');
        if (_error.indexOf('Invalid code')) return setInputError(true);
        errorTip(
          {
            errorFields: 'CodeVerify',
            error: _error,
          },
          isErrorTip,
          onError,
        );
      }
    },

    [
      verifierSessionId,
      guardianIdentifier,
      verifier.id,
      chainId,
      operationType,
      onSuccess,
      setInputError,
      isErrorTip,
      onError,
    ],
  );

  const reCaptchaHandler = useReCaptchaModal();

  const resendCode = useCallback(async () => {
    try {
      if (!guardianIdentifier) throw Error('Missing loginGuardianType');
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
      if (!result.verifierSessionId)
        return console.warn('The request was rejected, please check whether the parameters are correct');
      uiRef.current?.setTimer(MAX_TIMER);
      onReSend?.({ verifier, ...result });
      setVerifierSessionId(result.verifierSessionId);
    } catch (error: any) {
      const msg = handleErrorMessage(error);
      errorTip(
        {
          errorFields: 'CodeVerify',
          error: msg,
        },
        isErrorTip,
        onError,
      );
    }
  }, [
    accountType,
    chainId,
    guardianIdentifier,
    isErrorTip,
    onError,
    onReSend,
    operationType,
    reCaptchaHandler,
    verifier,
  ]);

  return (
    <CodeVerifyUI
      ref={uiRef}
      code={pinVal}
      error={codeError}
      enableKeyboard={isMobile}
      tipExtra={tipExtra}
      verifier={verifier}
      className={className}
      isCountdownNow={isCountdownNow}
      isLoginGuardian={isLoginGuardian}
      guardianIdentifier={guardianIdentifier}
      accountType={accountType}
      onCodeChange={setPinVal}
      onReSend={resendCode}
      onCodeFinish={onFinish}
    />
  );
}
