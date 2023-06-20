import { useState, useCallback, memo, useEffect, useRef } from 'react';
import { AccountTypeEnum } from '@portkey/services';
import VerifierSelect, { VerifierSelectConfirmResult } from '../../../VerifierSelect/index.component';
import CodeVerify from '../../../CodeVerify/index.component';
import { IVerifyInfo } from '../../../types/verify';
import BackHeader from '../../../BackHeader';
import { OnErrorFunc } from '../../../../types/error';
import type { ChainInfo } from '@portkey/services';
import { ChainType } from '@portkey/types';
import { VerifierItem } from '@portkey/did';
import { useUpdateEffect } from 'react-use';
import { Step2SignUpLifeCycleType } from '../../../SignStep/types';
import { getVerifierList } from '../../../../utils/sandboxUtil/getVerifierList';
import { SignInSuccess } from '../../../types';
import { portkeyDidUIPrefix } from '../../../../constants';
import ConfigProvider from '../../../config-provider';
import { setLoading } from '../../../../utils';

const step2Storage = `${portkeyDidUIPrefix}step1Storage`;

type Step2FinishParams = { verifier: VerifierItem } & IVerifyInfo;

interface Step2WithSignUpProps {
  sandboxId?: string;
  chainInfo?: ChainInfo;
  chainType?: ChainType;
  isErrorTip?: boolean;
  guardianIdentifierInfo: SignInSuccess;
  onCancel?: () => void;
  onFinish?: (values: Step2FinishParams) => void;
  onError?: OnErrorFunc;
  onStepChange?: (step: Step2SignUpLifeCycleType) => void;
}

function Step2WithSignUp({
  isErrorTip = true,
  sandboxId,
  chainInfo,
  chainType,
  guardianIdentifierInfo,
  onFinish,
  onCancel,
  onError,
  onStepChange,
}: Step2WithSignUpProps) {
  const [signUpStep, setSignUpStep] = useState<Step2SignUpLifeCycleType>('VerifierSelect');
  const [sendCodeInfo, setSendCodeInfo] = useState<VerifierSelectConfirmResult>();
  const onErrorRef = useRef<Step2WithSignUpProps['onError']>(onError);
  const [verifierList, setVerifierList] = useState<VerifierItem[]>();
  useEffect(() => {
    onErrorRef.current = onError;
  });

  const getVerifierListHandler = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getVerifierList({
        sandboxId,
        chainId: guardianIdentifierInfo.chainId,
        rpcUrl: chainInfo?.endPoint,
        chainType: chainType ?? 'aelf',
        address: chainInfo?.caContractAddress,
      });
      setVerifierList(list);
    } catch (error) {
      onErrorRef?.current?.({
        errorFields: 'Get verifierList',
        error: error,
      });
    } finally {
      setLoading(false);
    }
  }, [chainInfo, chainType, guardianIdentifierInfo.chainId, sandboxId]);

  useEffect(() => {
    getVerifierListHandler();
  }, [getVerifierListHandler]);

  const onVerifierSelectConfirm = useCallback(
    (info: VerifierSelectConfirmResult) => {
      setSendCodeInfo(info);
      ConfigProvider.config.storageMethod?.setItem(step2Storage, JSON.stringify(info));
      if (
        guardianIdentifierInfo.accountType === AccountTypeEnum[AccountTypeEnum.Apple] ||
        guardianIdentifierInfo.accountType === AccountTypeEnum[AccountTypeEnum.Google]
      ) {
        onFinish?.(info as Step2FinishParams);
        return;
      }
      setSignUpStep('CodeVerify');
    },
    [guardianIdentifierInfo.accountType, onFinish],
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
    if (signUpStep === 'CodeVerify') {
      setSignUpStep('VerifierSelect');
    } else {
      onCancel?.();
    }
  }, [onCancel, signUpStep]);

  useUpdateEffect(() => {
    onStepChange?.(signUpStep);
  }, [signUpStep]);

  return (
    <div className="step-page-wrapper">
      <BackHeader onBack={onBackHandler} />
      {signUpStep === 'VerifierSelect' && (
        <VerifierSelect
          chainId={guardianIdentifierInfo.chainId}
          className="content-padding"
          guardianIdentifier={guardianIdentifierInfo.identifier}
          verifierList={verifierList}
          isErrorTip={isErrorTip}
          onError={onError}
          accountType={guardianIdentifierInfo.accountType}
          onConfirm={onVerifierSelectConfirm}
          appleIdToken={guardianIdentifierInfo.authenticationInfo?.appleIdToken}
          googleAccessToken={guardianIdentifierInfo.authenticationInfo?.googleAccessToken}
        />
      )}
      {signUpStep === 'CodeVerify' && sendCodeInfo?.verifierSessionId ? (
        <CodeVerify
          chainId={guardianIdentifierInfo.chainId}
          className="content-padding"
          guardianIdentifier={guardianIdentifierInfo.identifier}
          verifier={sendCodeInfo.verifier}
          accountType={guardianIdentifierInfo.accountType}
          isCountdownNow={true}
          isLoginAccount={true}
          verifierSessionId={sendCodeInfo.verifierSessionId}
          isErrorTip={isErrorTip}
          onError={onError}
          onSuccess={onCodeVerifySuccess}
          onReSend={(result) => setSendCodeInfo(result)}
        />
      ) : (
        signUpStep === 'CodeVerify' && 'Missing sendCodeInfo'
      )}
    </div>
  );
}
export default memo(Step2WithSignUp);
