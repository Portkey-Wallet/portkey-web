import { AccountType, AccountTypeEnum } from '@portkey/services';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { ValidatorHandler } from '../../types';
import EmailInputAndButton from '../EmailInputAndButton';
import { GuardianInputInfo } from '../types/signIn';
import './index.less';
import BackHeader from '../BackHeader';
import CustomSvg from '../CustomSvg';
import { CreateWalletType } from '../types';

export interface EmailLoginProps {
  confirmText?: string;
  type?: 'Login' | 'SignUp';
  isLoading?: boolean;
  validateEmail?: ValidatorHandler;
  onFinish?: (v: GuardianInputInfo) => void;
  onBack?: () => void;
  onClose?: () => void;
  switchType?: (type: CreateWalletType) => void;
  rightElement?: React.ReactNode;
}

export interface EmailLoginRef {
  setActiveKey: (key: AccountType) => void;
}

const EmailLogin = forwardRef(
  (
    {
      confirmText = 'Continue',
      type = 'Login',
      isLoading = false,
      onFinish,
      onClose,
      onBack,
      validateEmail,
      switchType,
      rightElement,
    }: EmailLoginProps,
    ref,
  ) => {
    const [currentType, setCurrentType] = useState(type);
    useImperativeHandle(
      ref,
      () => ({
        setCurrentType,
      }),
      [],
    );
    useEffect(() => {
      switchType?.(currentType);
    }, [currentType, switchType]);
    const handleLoginAction = useCallback(() => {
      setCurrentType('SignUp');
    }, []);

    const handleSignUpAction = useCallback(() => {
      setCurrentType('Login');
    }, []);

    return (
      <div className="input-info-wrapper email-login">
        <BackHeader
          leftElement={undefined}
          // onBack={() => setType('Login')}
          onBack={onBack}
          rightElement={
            rightElement ? (
              rightElement
            ) : (
              <CustomSvg
                type="X"
                onClick={onClose}
                style={{
                  width: 20,
                  height: 20,
                  cursor: 'pointer',
                }}
              />
            )
          }
        />
        <div className="email-login-title">{currentType === 'Login' ? 'Log in via email' : 'Create your account'}</div>
        <div className="email-login-email-text" />
        <EmailInputAndButton
          confirmText={confirmText}
          isLoading={isLoading}
          validate={validateEmail}
          onFinish={(v) =>
            onFinish?.({
              accountType: AccountTypeEnum[AccountTypeEnum.Email] as AccountType,
              identifier: v,
              type: currentType,
            })
          }
        />
        {currentType === 'Login' ? (
          <div className="email-login-footer">
            <span>Don’t have an account?&nbsp;</span>
            <span className="email-login-footer-action" onClick={handleLoginAction}>
              Sign up
            </span>
          </div>
        ) : (
          <div className="email-login-footer">
            <span>Already have an account?&nbsp;</span>
            <span className="email-login-footer-action" onClick={handleSignUpAction}>
              Log in
            </span>
          </div>
        )}
      </div>
    );
  },
);

export default EmailLogin;
