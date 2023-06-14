import SignUpAndLogin, { SignUpAndLoginProps } from '../../../SignUpAndLogin/index.component';
import { useCallback, useState, memo, useEffect, useRef } from 'react';
import type { DIDWalletInfo, GuardianInputInfo, SignInSuccess } from '../../../types';
import type { SignInLifeCycleType, TStepFirstType } from '../../../SignStep/types';
import { useUpdateEffect } from 'react-use';
import qs from 'query-string';
import LoginModal from '../../../LoginModal';
import UserInput from '../../../UserInput/index.component';

export type OnSignInFinishedFun = (values: {
  isFinished: boolean;
  result: {
    type?: SignInLifeCycleType;
    value: GuardianInputInfo | DIDWalletInfo;
  };
}) => void;

interface Step1Props extends SignUpAndLoginProps {
  stepFirstType?: TStepFirstType;
  onSignInFinished: OnSignInFinishedFun;
  onStepChange?: (v: SignInLifeCycleType) => void;
}

function Step1({ stepFirstType, onStepChange, onSignInFinished, ...props }: Step1Props) {
  const [createType, setCreateType] = useState<SignInLifeCycleType>('Login');
  const [open, setOpen] = useState<boolean>();

  const signInSuccessRef = useRef<SignInSuccess>();

  const onSuccess = useCallback(
    (value: SignInSuccess) => {
      signInSuccessRef.current = value;
      if (value.isLoginIdentifier && createType !== 'Login') return setOpen(true);
      if (!value.isLoginIdentifier && createType !== 'SignUp') return setOpen(true);
      onSignInFinished?.({
        isFinished: false,
        result: {
          type: createType,
          value,
        },
      });
    },
    [createType, onSignInFinished],
  );

  useUpdateEffect(() => {
    createType && onStepChange?.(createType);
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
    <>
      {stepFirstType === 'connectFirst' && <UserInput {...props} appleIdToken={appleIdToken} onSuccess={onSuccess} />}
      {stepFirstType !== 'connectFirst' && (
        <SignUpAndLogin {...props} appleIdToken={appleIdToken} onSignTypeChange={setCreateType} onSuccess={onSuccess} />
      )}

      <LoginModal
        open={open}
        type={createType}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          if (!signInSuccessRef.current) return setOpen(false);
          const createType = signInSuccessRef.current.isLoginIdentifier ? 'Login' : 'SignUp';
          setCreateType(createType);
          onSignInFinished?.({
            isFinished: false,
            result: {
              type: createType,
              value: signInSuccessRef.current,
            },
          });
        }}
      />
    </>
  );
}
export default memo(Step1);
