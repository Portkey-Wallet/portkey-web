import { useState, useCallback, memo, useEffect, useRef } from 'react';
import { AccountTypeEnum, RecaptchaType, VerifierCodeOperationType } from '@portkey/services';
import VerifierSelect, { VerifierSelectConfirmResult } from '../../../VerifierSelect/index.component';
import CodeVerify from '../../../CodeVerify/index.component';
import { IVerifyInfo } from '../../../types/verify';
import BackHeader from '../../../BackHeader';
import { OnErrorFunc } from '../../../../types/error';
import { ChainType } from '@portkey/types';
import { VerifierItem } from '@portkey/did';
import { Step2SignUpLifeCycleType, TStep2SignUpLifeCycle } from '../../../SignStep/types';
import { IGuardianIdentifierInfo } from '../../../types';
import { portkeyDidUIPrefix } from '../../../../constants';
import ConfigProvider from '../../../config-provider';

const step2Storage = `${portkeyDidUIPrefix}step1Storage`;

type Step2FinishParams = { verifier: VerifierItem } & IVerifyInfo;

interface Step2WithSignUpProps {
  sandboxId?: string;
  chainType?: ChainType;
  defaultSignUpStep?: Step2SignUpLifeCycleType;
  defaultCodeInfo?: VerifierSelectConfirmResult;
  isErrorTip?: boolean;
  guardianIdentifierInfo: IGuardianIdentifierInfo;
  onCancel?(): void;
  onFinish?(values: Step2FinishParams): void;
  onError?: OnErrorFunc;
  onStepChange?(step: 'VerifierSelect', info: TStep2SignUpLifeCycle['VerifierSelect']): void;
  onStepChange?(step: 'SignUpCodeVerify', info: TStep2SignUpLifeCycle['SignUpCodeVerify']): void;
}

function Step2WithSignUp({
  isErrorTip = true,
  sandboxId,
  chainType,
  defaultSignUpStep,
  defaultCodeInfo,
  guardianIdentifierInfo,
  onFinish,
  onCancel,
  onError,
  onStepChange,
}: Step2WithSignUpProps) {
  const [signUpStep, setSignUpStep] = useState<Step2SignUpLifeCycleType>(
    defaultCodeInfo ? defaultSignUpStep || 'VerifierSelect' : 'VerifierSelect',
  );
  const [sendCodeInfo, setSendCodeInfo] = useState<VerifierSelectConfirmResult | undefined>(defaultCodeInfo);
  const onErrorRef = useRef<Step2WithSignUpProps['onError']>(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  });

  const onVerifierSelectConfirm = useCallback(
    (info: VerifierSelectConfirmResult) => {
      ConfigProvider.config.storageMethod?.setItem(step2Storage, JSON.stringify(info));
      if (
        guardianIdentifierInfo.accountType === AccountTypeEnum[AccountTypeEnum.Apple] ||
        guardianIdentifierInfo.accountType === AccountTypeEnum[AccountTypeEnum.Google]
      ) {
        onFinish?.(info as Step2FinishParams);
        return;
      }
      setSendCodeInfo((preInfo) => {
        if (preInfo?.verifierSessionId === info.verifierSessionId) return preInfo;
        if (info.verifierSessionId) {
          const verifierSelectResult = {
            verifierSessionId: info.verifierSessionId,
            verifier: info.verifier,
          };
          onStepChange?.('SignUpCodeVerify', { guardianIdentifierInfo, verifierSelectResult });
        }
        return info;
      });
      setSignUpStep('SignUpCodeVerify');
    },
    [guardianIdentifierInfo, onFinish, onStepChange],
  );

  const onCodeVerifySuccess = useCallback(
    (res: IVerifyInfo) => {
      if (!sendCodeInfo?.verifier) throw 'No verifier Info';
      onFinish?.({
        verifier: sendCodeInfo.verifier,
        ...res,
      });
    },
    [onFinish, sendCodeInfo],
  );

  const onBackHandler = useCallback(() => {
    if (signUpStep === 'SignUpCodeVerify') {
      setSignUpStep('VerifierSelect');
      onStepChange?.('VerifierSelect', { guardianIdentifierInfo });
    } else {
      onCancel?.();
    }
  }, [guardianIdentifierInfo, onCancel, onStepChange, signUpStep]);

  const onReSend = useCallback(
    (info: VerifierSelectConfirmResult) => {
      setSendCodeInfo((preInfo) => {
        if (preInfo?.verifierSessionId === info.verifierSessionId) return preInfo;
        if (info.verifierSessionId) {
          const verifierSelectResult = {
            verifierSessionId: info.verifierSessionId,
            verifier: info.verifier,
          };
          onStepChange?.('SignUpCodeVerify', { guardianIdentifierInfo, verifierSelectResult });
        }
      });
    },
    [guardianIdentifierInfo, onStepChange],
  );

  return (
    <div className="step-page-wrapper">
      <BackHeader onBack={onBackHandler} />
      {signUpStep === 'VerifierSelect' && (
        <VerifierSelect
          sandboxId={sandboxId}
          chainType={chainType}
          operationType={RecaptchaType.register}
          chainId={guardianIdentifierInfo.chainId}
          className="content-padding"
          guardianIdentifier={guardianIdentifierInfo.identifier}
          isErrorTip={isErrorTip}
          onError={onError}
          accountType={guardianIdentifierInfo.accountType}
          onConfirm={onVerifierSelectConfirm}
          appleIdToken={guardianIdentifierInfo.authenticationInfo?.appleIdToken}
          googleAccessToken={guardianIdentifierInfo.authenticationInfo?.googleAccessToken}
        />
      )}
      {signUpStep === 'SignUpCodeVerify' && sendCodeInfo?.verifierSessionId ? (
        <CodeVerify
          chainId={guardianIdentifierInfo.chainId}
          className="content-padding"
          guardianIdentifier={guardianIdentifierInfo.identifier}
          verifier={sendCodeInfo.verifier}
          accountType={guardianIdentifierInfo.accountType}
          isCountdownNow={true}
          isLoginGuardian={true}
          verifierSessionId={sendCodeInfo.verifierSessionId}
          isErrorTip={isErrorTip}
          verifierCodeOperation={VerifierCodeOperationType.register}
          onError={onError}
          onSuccess={onCodeVerifySuccess}
          onReSend={onReSend}
        />
      ) : (
        signUpStep === 'SignUpCodeVerify' && 'Missing sendCodeInfo'
      )}
    </div>
  );
}
export default memo(Step2WithSignUp);
