import SignUpAndLogin, { SignUpAndLoginProps } from '../../../SignUpAndLogin/index.component';
import { useCallback, useState, memo, useEffect } from 'react';
import type { DIDWalletInfo, GuardianInputInfo, SignInSuccess } from '../../../types';
import type { SignInLifeCycleType } from '../../types';
import { useUpdateEffect } from 'react-use';
import qs from 'query-string';

export type OnSignInFinishedFun = (values: {
  isFinished: boolean;
  result: {
    type?: SignInLifeCycleType;
    value: GuardianInputInfo | DIDWalletInfo;
  };
}) => void;

interface Step1Props extends SignUpAndLoginProps {
  onSignInFinished: OnSignInFinishedFun;
  onStepChange?: (v: SignInLifeCycleType) => void;
}

function Step1({ onStepChange, onSignInFinished, ...props }: Step1Props) {
  const [createType, setCreateType] = useState<SignInLifeCycleType>('Login');

  const onSuccess = useCallback(
    (value: SignInSuccess) => {
      const createType = value.isLoginIdentifier ? 'Login' : 'SignUp';
      onSignInFinished?.({
        isFinished: false,
        result: {
          type: createType,
          value,
        },
      });
      setCreateType(createType);
    },
    [onSignInFinished],
  );

  const _onFinish = useCallback(
    (walletInfo: any) => {
      onSignInFinished?.({
        isFinished: true,
        result: {
          value: walletInfo,
        },
      });
    },
    [onSignInFinished],
  );

  useUpdateEffect(() => {
    onStepChange?.(createType);
  }, [createType]);

  const [appleIdToken, setAppleIdToken] = useState<string>();

  useEffect(() => {
    const { id_token } = qs.parse(location.search);
    if (id_token && typeof id_token === 'string') {
      setAppleIdToken(id_token);
    }
    return () => {
      history.pushState(null, '', `${location.pathname}`);
    };
  }, []);

  return (
    <SignUpAndLogin
      {...props}
      appleIdToken={appleIdToken}
      onSignTypeChange={setCreateType}
      onSuccess={onSuccess}
      onFinish={_onFinish}
    />
  );
}
export default memo(Step1);
