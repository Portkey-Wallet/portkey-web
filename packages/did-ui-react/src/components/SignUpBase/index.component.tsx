import { useState, useCallback, useRef, useEffect, useMemo, ReactNode } from 'react';
import {
  ISocialLoginConfig,
  NetworkType,
  OnErrorFunc,
  SocialLoginFinishHandler,
  TotalAccountType,
  ValidatorHandler,
} from '../../types';
import InputLogin from '../InputLogin';
import { IPhoneCountry, LoginFinishWithoutPin } from '../types';
import SocialLogin from '../SocialLogin';
import { GuardianInputInfo } from '../types/signIn';
import clsx from 'clsx';
import ConfigProvider from '../config-provider';
import { AccountType } from '@portkey/services';
import './index.less';

enum STEP {
  socialLogin,
  inputLogin,
}

export interface SignUpBaseProps {
  phoneCountry?: IPhoneCountry;
  socialLogin?: ISocialLoginConfig;
  isErrorTip?: boolean;
  isMobile?: boolean;
  wrapperClassName?: string;
  extraElement?: ReactNode; // extra element
  termsOfService?: ReactNode;
  privacyPolicy?: string;
  networkType: NetworkType;
  loginMethodsOrder?: TotalAccountType[];
  recommendIndexes?: number[];
  onLoginByPortkey?: LoginFinishWithoutPin;
  onBack?: () => void;
  onError?: OnErrorFunc;
  onInputFinish?: (data: GuardianInputInfo) => void;
  validateEmail?: ValidatorHandler;
  validatePhone?: ValidatorHandler;
  onSocialSignFinish?: SocialLoginFinishHandler;
}

export default function SignUpBase({
  socialLogin,
  phoneCountry,
  isErrorTip = true,
  isMobile,
  networkType,
  wrapperClassName,
  extraElement,
  termsOfService,
  privacyPolicy,
  loginMethodsOrder,
  recommendIndexes,
  onBack,
  onError,
  onInputFinish,
  validateEmail,
  validatePhone,
  onSocialSignFinish,
  onLoginByPortkey,
}: SignUpBaseProps) {
  const [step, setStep] = useState<STEP>(STEP.socialLogin);

  const onBackRef = useRef<SignUpBaseProps['onBack']>();
  const _socialLogin = useMemo(() => socialLogin || ConfigProvider.getSocialLoginConfig(), [socialLogin]);

  useEffect(() => {
    onBackRef.current = onBack;
  });

  const _onBack = useCallback(() => {
    setStep(STEP.socialLogin);
    onBackRef?.current?.();
  }, []);

  const [defaultKey, setDefaultKey] = useState<AccountType>();

  return (
    <div className={clsx('register-start-card sign-ui-card', wrapperClassName)}>
      {step === STEP.inputLogin ? (
        <InputLogin
          type="Sign up"
          phoneCountry={phoneCountry}
          defaultAccountType={defaultKey}
          validateEmail={validateEmail}
          validatePhone={validatePhone}
          onFinish={onInputFinish}
          onBack={() => setStep(STEP.socialLogin)}
        />
      ) : (
        <SocialLogin
          type="Sign up"
          className="portkey-ui-flex-1"
          isMobile={isMobile}
          extraElement={extraElement}
          termsOfService={termsOfService}
          privacyPolicy={privacyPolicy}
          isErrorTip={isErrorTip}
          networkType={networkType}
          socialLogin={_socialLogin}
          loginMethodsOrder={loginMethodsOrder}
          recommendIndexes={recommendIndexes}
          onFinish={onSocialSignFinish}
          switchGuardianType={(type) => {
            setStep(STEP.inputLogin);
            setDefaultKey(type);
          }}
          onBack={_onBack}
          onError={onError}
          onLoginByPortkey={onLoginByPortkey}
        />
      )}
    </div>
  );
}
