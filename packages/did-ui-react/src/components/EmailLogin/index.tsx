import { AccountType, AccountTypeEnum } from '@portkey/services';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { ValidatorHandler } from '../../types';
import EmailInputAndButton from '../EmailInputAndButton';
import { GuardianInputInfo } from '../types/signIn';
import './index.less';

export interface EmailLoginProps {
  confirmText?: string;
  type?: 'Login' | 'SignUp';
  isLoading?: boolean;
  validateEmail?: ValidatorHandler;
  onFinish?: (v: GuardianInputInfo) => void;
}

export interface EmailLoginRef {
  setActiveKey: (key: AccountType) => void;
}

const EmailLogin = forwardRef(
  ({ confirmText = 'Continue', type = 'Login', isLoading = false, onFinish, validateEmail }: EmailLoginProps, ref) => {
    const [currentType, setCurrentType] = useState(type);
    useImperativeHandle(
      ref,
      () => ({
        setCurrentType,
      }),
      [],
    );

    const handleLoginAction = useCallback(() => {
      setCurrentType('SignUp');
    }, []);

    const handleSignUpAction = useCallback(() => {
      setCurrentType('Login');
    }, []);

    return (
      <div className="input-info-wrapper email-login">
        <div className="email-login-title">{currentType === 'Login' ? 'Log in via email' : 'Create your account'}</div>
        <div className="email-login-email-text">Email</div>
        <EmailInputAndButton
          confirmText={confirmText}
          isLoading={isLoading}
          validate={validateEmail}
          onFinish={(v) =>
            onFinish?.({
              accountType: AccountTypeEnum[AccountTypeEnum.Email] as AccountType,
              identifier: v,
            })
          }
        />
        {currentType === 'Login' ? (
          <div className="email-login-footer">
            <span>Don’t have an account?&nbsp;</span>
            <span className="email-login-footer-action" onClick={handleLoginAction}>
              Log in
            </span>
          </div>
        ) : (
          <div className="email-login-footer">
            <span>Already have an account?&nbsp;</span>
            <span className="email-login-footer-action" onClick={handleSignUpAction}>
              Sign up
            </span>
          </div>
        )}
      </div>
    );
  },
);

export default EmailLogin;
