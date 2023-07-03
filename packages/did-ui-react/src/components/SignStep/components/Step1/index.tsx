import SignUpAndLogin, { SignUpAndLoginProps } from '../../../SignUpAndLogin/index.component';
import { useCallback, useState, memo, useEffect, useRef } from 'react';
import type { DIDWalletInfo, IGuardianIdentifierInfo } from '../../../types';
import type { SignInLifeCycleType, TDesign } from '../../../SignStep/types';
import { useUpdateEffect } from 'react-use';
import qs from 'query-string';
import LoginModal from '../../../LoginModal';
import UserInput from '../../../UserInput/index.component';

export type OnSignInFinishedFun = (values: {
  isFinished: boolean;
  result: {
    type?: SignInLifeCycleType;
    value: IGuardianIdentifierInfo | DIDWalletInfo;
  };
}) => void;

interface Step1Props extends SignUpAndLoginProps {
  design?: TDesign;
  onSignInFinished: OnSignInFinishedFun;
  onStepChange?: (v: SignInLifeCycleType) => void;
}

function Step1({ design, onStepChange, onSignInFinished, type, ...props }: Step1Props) {
  const [createType, setCreateType] = useState<SignInLifeCycleType>(type || 'Login');
  const [open, setOpen] = useState<boolean>();
  const signInSuccessRef = useRef<IGuardianIdentifierInfo>();

  const onSuccess = useCallback(
    (value: IGuardianIdentifierInfo) => {
      signInSuccessRef.current = value;
      if (value.isLoginGuardian && createType !== 'Login') return setOpen(true);
      if (!value.isLoginGuardian && createType !== 'SignUp') return setOpen(true);
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
      {design === 'SocialDesign' && (
        <UserInput
          {...props}
          type={type === 'LoginByScan' ? 'Scan' : null}
          appleIdToken={appleIdToken}
          onSuccess={onSuccess}
        />
      )}
      {design !== 'SocialDesign' && (
        <SignUpAndLogin
          {...props}
          type={type}
          appleIdToken={appleIdToken}
          onSignTypeChange={setCreateType}
          onSuccess={onSuccess}
        />
      )}

      <LoginModal
        open={open}
        type={createType}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          if (!signInSuccessRef.current) return setOpen(false);
          const createType = signInSuccessRef.current.isLoginGuardian ? 'Login' : 'SignUp';
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
