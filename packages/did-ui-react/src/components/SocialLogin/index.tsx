import { Button } from 'antd';
import { useMemo, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { ISocialLoginConfig, OnErrorFunc, RegisterType, SocialLoginFinishHandler } from '../../types';
import CustomSvg from '../CustomSvg';
import DividerCenter from '../DividerCenter';
import SocialContent from '../SocialContent';
import TermsOfServiceItem from '../TermsOfServiceItem';
import { CreateWalletType, LoginFinishWithoutPin } from '../types';
import './index.less';

interface SocialLoginProps {
  type: RegisterType;
  className?: string;
  isShowScan?: boolean;
  socialLogin?: ISocialLoginConfig;
  termsOfServiceUrl?: string;
  networkType?: string;
  onBack?: () => void;
  onFinish?: SocialLoginFinishHandler;
  switchGuardinType?: () => void;
  switchType?: (type: CreateWalletType) => void;
  onLoginByPortkey?: LoginFinishWithoutPin;

  isErrorTip?: boolean;
  onError?: OnErrorFunc;
}

export default function SocialLogin({
  type,
  className,
  isShowScan,
  isErrorTip,
  socialLogin,
  networkType,
  termsOfServiceUrl,
  onBack,
  onError,
  onFinish,
  switchGuardinType,
  onLoginByPortkey,
  switchType,
}: SocialLoginProps) {
  const { t } = useTranslation();
  const onBackRef = useRef<SocialLoginProps['onBack']>(onBack);
  const onFinishRef = useRef<SocialLoginProps['onFinish']>(onFinish);
  const switchGuardinTypeRef = useRef<SocialLoginProps['switchGuardinType']>(switchGuardinType);
  const switchTypeRef = useRef<SocialLoginProps['switchType']>(switchType);
  useEffect(() => {
    onBackRef.current = onBack;
    onFinishRef.current = onFinish;
    switchGuardinTypeRef.current = switchGuardinType;
    switchTypeRef.current = switchType;
  });

  const isLogin = useMemo(() => type === 'Login', [type]);

  return (
    <>
      <div className={clsx('social-login-wrapper', className)}>
        <h1 className="flex-between-center social-login-title">
          {!isLogin && <CustomSvg type="BackLeft" onClick={onBackRef?.current} />}
          {isLogin && <span></span>}
          <span className="title">{t(type)}</span>
          {isLogin && isShowScan && <CustomSvg type="QRCode" onClick={() => switchTypeRef?.current?.('LoginByScan')} />}
          {!isLogin && <span className="empty"></span>}
        </h1>
        <div className="social-login-content">
          <SocialContent
            isErrorTip={isErrorTip}
            networkType={networkType}
            socialLogin={socialLogin}
            type={type}
            onFinish={onFinishRef?.current}
            onLoginByPortkey={onLoginByPortkey}
            onError={onError}
          />
          <DividerCenter />
          <Button type="primary" className="login-by-input-btn" onClick={switchGuardinTypeRef?.current}>
            {t(`${type} with Phone / Email`)}
          </Button>
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
      <TermsOfServiceItem termsOfServiceUrl={termsOfServiceUrl} />
    </>
  );
}
