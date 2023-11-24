import { Button } from 'antd';
import { useMemo, useRef, useEffect, ReactNode } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { ISocialLoginConfig, OnErrorFunc, RegisterType, SocialLoginFinishHandler } from '../../types';
import CustomSvg from '../CustomSvg';
import DividerCenter from '../DividerCenter';
import SocialContent from '../SocialContent';
import TermsOfServiceItem from '../TermsOfServiceItem';
import { CreateWalletType, LoginFinishWithoutPin, Theme } from '../types';
import './index.less';

interface SocialLoginProps {
  type: RegisterType;
  theme?: Theme;
  className?: string;
  isShowScan?: boolean;
  socialLogin?: ISocialLoginConfig;
  termsOfService?: ReactNode;
  extraElement?: ReactNode; // extra element
  networkType?: string;
  onBack?: () => void;
  onFinish?: SocialLoginFinishHandler;
  switchGuardianType?: () => void;
  switchType?: (type: CreateWalletType) => void;
  onLoginByPortkey?: LoginFinishWithoutPin;

  isErrorTip?: boolean;
  onError?: OnErrorFunc;
}

export default function SocialLogin({
  type,
  theme,
  className,
  isShowScan,
  isErrorTip = true,
  socialLogin,
  networkType,
  extraElement,
  termsOfService,
  onBack,
  onError,
  onFinish,
  switchGuardianType: switchGuardianType,
  onLoginByPortkey,
  switchType,
}: SocialLoginProps) {
  const { t } = useTranslation();
  const onBackRef = useRef<SocialLoginProps['onBack']>(onBack);
  const onFinishRef = useRef<SocialLoginProps['onFinish']>(onFinish);
  const switchGuardianTypeRef = useRef<SocialLoginProps['switchGuardianType']>(switchGuardianType);
  const switchTypeRef = useRef<SocialLoginProps['switchType']>(switchType);
  useEffect(() => {
    onBackRef.current = onBack;
    onFinishRef.current = onFinish;
    switchGuardianTypeRef.current = switchGuardianType;
    switchTypeRef.current = switchType;
  });

  const isLogin = useMemo(() => type === 'Login', [type]);

  return (
    <>
      <div className={clsx('portkey-ui-flex-column', 'social-login-wrapper', className)}>
        <h1 className="portkey-ui-flex-between-center font-medium social-login-title">
          {!isLogin && <CustomSvg type="BackLeft" onClick={onBackRef?.current} />}
          {isLogin && <span></span>}
          <span className="title">{t(type)}</span>
          {isLogin && isShowScan && <CustomSvg type="QRCode" onClick={() => switchTypeRef?.current?.('LoginByScan')} />}
          {!isLogin && <span className="empty"></span>}
        </h1>
        <div className="portkey-ui-flex-column portkey-ui-flex-1 social-login-content">
          <SocialContent
            theme={theme}
            isErrorTip={isErrorTip}
            networkType={networkType}
            socialLogin={socialLogin}
            type={type}
            onFinish={onFinishRef?.current}
            onLoginByPortkey={onLoginByPortkey}
            onError={onError}
          />
          <DividerCenter />
          <Button type="primary" className="login-by-input-btn" onClick={switchGuardianTypeRef?.current}>
            {t(`${type} with Phone / Email`)}
          </Button>
          {extraElement}

          {isLogin && (
            <div className="go-sign-up">
              <span>{t('No account?')}</span>
              <span
                className="sign-text"
                onClick={() => {
                  switchTypeRef?.current?.('SignUp');
                }}>
                {t('Sign up')}
              </span>
            </div>
          )}
        </div>
      </div>

      <TermsOfServiceItem termsOfService={termsOfService} />
    </>
  );
}
