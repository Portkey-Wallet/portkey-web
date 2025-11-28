import { useState, useCallback, memo, useEffect, useRef } from 'react';
import { OperationTypeEnum } from '@portkey/services';
import CodeVerify from '../../../CodeVerify/index.component';
import { IVerifier, IVerifyInfo } from '../../../types/verify';
import BackHeader from '../../../BackHeader';
import { OnErrorFunc } from '../../../../types/error';
import { IGuardianIdentifierInfo } from '../../../types';
import { TStep2SignUpLifeCycle, TVerifyCodeInfo } from '../../types';
import { getOperationDetails } from '../../../utils/operation.util';

type Step2FinishParams = { verifier: IVerifier } & IVerifyInfo;

interface Step2WithSignUpProps {
  verifierCodeInfo?: TVerifyCodeInfo;
  isErrorTip?: boolean;
  guardianIdentifierInfo: IGuardianIdentifierInfo;
  onCancel?(): void;
  onFinish?(values: Step2FinishParams): void;
  onError?: OnErrorFunc;
  onStepChange?(step: 'SignUpCodeVerify', info: TStep2SignUpLifeCycle['SignUpCodeVerify']): void;
}

function Step2WithSignUp({
  isErrorTip = true,
  verifierCodeInfo,
  guardianIdentifierInfo,
  onFinish,
  onCancel,
  onError,
  onStepChange,
}: Step2WithSignUpProps) {
  const [sendCodeInfo, setSendCodeInfo] = useState<TVerifyCodeInfo | undefined>(verifierCodeInfo);
  const onErrorRef = useRef<Step2WithSignUpProps['onError']>(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  });

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

  const onReSend = useCallback(
    (info: TVerifyCodeInfo) => {
      setSendCodeInfo((preInfo) => {
        if (preInfo?.verifierSessionId === info.verifierSessionId) return preInfo;
        onStepChange?.('SignUpCodeVerify', {
          guardianIdentifierInfo,
          verifyCodeInfo: info,
        });

        return info;
      });
    },
    [guardianIdentifierInfo, onStepChange],
  );

  return (
    <div className="step-page-wrapper">
      <BackHeader onBack={onCancel} />
      {sendCodeInfo ? (
        <CodeVerify
          originChainId={guardianIdentifierInfo.chainId}
          className="content-padding"
          guardianIdentifier={guardianIdentifierInfo.identifier}
          verifier={sendCodeInfo.verifier}
          accountType={guardianIdentifierInfo.accountType}
          isCountdownNow={true}
          isLoginGuardian={true}
          verifierSessionId={sendCodeInfo.verifierSessionId}
          isErrorTip={isErrorTip}
          operationType={OperationTypeEnum.register}
          operationDetails={getOperationDetails(OperationTypeEnum.register)}
          onError={onError}
          onSuccess={onCodeVerifySuccess}
          onReSend={onReSend}
        />
      ) : (
        'Missing sendCodeInfo'
      )}
    </div>
  );
}
export default memo(Step2WithSignUp);
