import { useState, useMemo, ReactNode } from 'react';
import {
  ISocialLoginConfig,
  OnErrorFunc,
  SocialLoginFinishHandler,
  TotalAccountType,
  ValidatorHandler,
} from '../../types';
import ConfigProvider from '../config-provider';
import InputLogin from '../InputLogin';
import SocialLogin from '../SocialLogin';
import { CreateWalletType, GuardianInputInfo, LoginFinishWithoutPin, Theme } from '../types';
import { IPhoneCountry } from '../types';
import './index.less';
import { AccountType } from '@portkey/services';

export interface LoginBaseProps {
  theme?: Theme;
  isShowScan?: boolean;
  isMobile?: boolean;
  termsOfService?: ReactNode;
  privacyPolicy?: string;
  extraElement?: ReactNode; // extra element
  phoneCountry?: IPhoneCountry;
  socialLogin?: ISocialLoginConfig;
  isErrorTip?: boolean;
  networkType?: string;
  loginMethodsOrder?: TotalAccountType[];
  recommendIndexes?: number[];
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
  isMobile,
  isShowScan,
  phoneCountry,
  isErrorTip = true,
  socialLogin: defaultSocialLogin,
  networkType,
  extraElement,
  termsOfService,
  privacyPolicy,
  loginMethodsOrder,
  recommendIndexes,
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

  const [defaultKey, setDefaultKey] = useState<AccountType>();

  return (
    <div className="portkey-ui-flex-column login-ui-card">
      {step === STEP.inputLogin ? (
        <InputLogin
          type="Login"
          defaultAccountType={defaultKey}
          phoneCountry={phoneCountry}
          validateEmail={validateEmail}
          validatePhone={validatePhone}
          onFinish={onInputFinish}
          onBack={() => setStep(STEP.socialLogin)}
        />
      ) : (
        <SocialLogin
          theme={theme}
          isMobile={isMobile}
          className="portkey-ui-flex-1"
          type="Login"
          networkType={networkType}
          socialLogin={socialLogin}
          isShowScan={isShowScan}
          isErrorTip={isErrorTip}
          onFinish={onSocialLoginFinish}
          switchType={onStep}
          switchGuardianType={(type) => {
            setStep(STEP.inputLogin);
            setDefaultKey(type);
          }}
          extraElement={extraElement}
          termsOfService={termsOfService}
          privacyPolicy={privacyPolicy}
          loginMethodsOrder={loginMethodsOrder}
          recommendIndexes={recommendIndexes}
          onLoginByPortkey={onLoginByPortkey}
          onError={onError}
        />
      )}
    </div>
  );
}
