import { useState, useMemo, ReactNode } from 'react';
import { ISocialLoginConfig, OnErrorFunc, SocialLoginFinishHandler, ValidatorHandler } from '../../types';
import ConfigProvider from '../config-provider';
import InputLogin from '../InputLogin';
import SocialLogin from '../SocialLogin';
import { CreateWalletType, GuardianInputInfo, LoginFinishWithoutPin, Theme } from '../types';
import { IPhoneCountry } from '../types';
import './index.less';

export interface LoginBaseProps {
  theme?: Theme;
  isShowScan?: boolean;
  termsOfService?: ReactNode;
  extraElement?: ReactNode; // extra element
  phoneCountry?: IPhoneCountry;
  socialLogin?: ISocialLoginConfig;
  isErrorTip?: boolean;
  networkType?: string;
  onLoginByPortkey?: LoginFinishWithoutPin;
  onInputFinish?: (data: GuardianInputInfo) => void;
  validateEmail?: ValidatorHandler;
  validatePhone?: ValidatorHandler;
  onSocialLoginFinish?: SocialLoginFinishHandler;
  onStep?: (value: CreateWalletType) => void;
  onError?: OnErrorFunc;
}

enum STEP {
  socialLogin,
  inputLogin,
}
export default function LoginCard({
  theme,
  isShowScan,
  phoneCountry,
  isErrorTip = true,
  socialLogin: defaultSocialLogin,
  networkType,
  extraElement,
  termsOfService,
  onStep,
  onError,
  onInputFinish,
  validateEmail,
  validatePhone,
  onLoginByPortkey,
  onSocialLoginFinish,
}: LoginBaseProps) {
  const socialLogin = useMemo(() => defaultSocialLogin || ConfigProvider.getSocialLoginConfig(), [defaultSocialLogin]);

  const [step, setStep] = useState<STEP>(STEP.socialLogin);

  return (
    <div className="portkey-ui-flex-column login-ui-card">
      {step === STEP.inputLogin ? (
        <InputLogin
          type="Login"
          phoneCountry={phoneCountry}
          validateEmail={validateEmail}
          validatePhone={validatePhone}
          onFinish={onInputFinish}
          onBack={() => setStep(STEP.socialLogin)}
        />
      ) : (
        <SocialLogin
          theme={theme}
          className="portkey-ui-flex-1"
          type="Login"
          networkType={networkType}
          socialLogin={socialLogin}
          isShowScan={isShowScan}
          isErrorTip={isErrorTip}
          onFinish={onSocialLoginFinish}
          switchType={onStep}
          switchGuardianType={() => setStep(STEP.inputLogin)}
          extraElement={extraElement}
          termsOfService={termsOfService}
          onLoginByPortkey={onLoginByPortkey}
          onError={onError}
        />
      )}
    </div>
  );
}
