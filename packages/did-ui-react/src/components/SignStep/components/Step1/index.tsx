import SignUpAndLogin, { SignUpAndLoginProps } from '../../../SignUpAndLogin/index.component';
import { useCallback, useState, memo, useRef } from 'react';
import type { DIDWalletInfo, IGuardianIdentifierInfo, TDesign, TSize } from '../../../types';
import { Design } from '../../../types';
import type { SignInLifeCycleType } from '../../../SignStep/types';
import { useUpdateEffect } from 'react-use';
import LoginModal from '../../../LoginModal';
import UserInput from '../../../UserInput/index.component';
import Web2Design from '../../../Web2Design/index.component';

export type OnSignInFinishedFun = (values: {
  isFinished: boolean;
  result: {
    type?: SignInLifeCycleType;
    value: IGuardianIdentifierInfo | DIDWalletInfo;
  };
}) => void;

interface Step1Props extends SignUpAndLoginProps {
  size?: TSize;
  design?: TDesign;
  onSignInFinished: OnSignInFinishedFun;
  onStepChange?: (v: SignInLifeCycleType) => void;
}

function Step1({ size, design, onStepChange, onSignInFinished, type, ...props }: Step1Props) {
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

  return (
    <>
      {design === Design.SocialDesign && (
        <UserInput {...props} type={type === 'LoginByScan' ? 'Scan' : null} onSuccess={onSuccess} />
      )}

      {design === Design.Web2Design && (
        <Web2Design {...props} size={size} type={type} onSignTypeChange={setCreateType} onSuccess={onSuccess} />
      )}

      {(!design || design === Design.CryptoDesign) && (
        <SignUpAndLogin {...props} type={type} onSignTypeChange={setCreateType} onSuccess={onSuccess} />
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
