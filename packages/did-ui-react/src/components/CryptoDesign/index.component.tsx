import LoginCard from '../LoginBase/index.component';
import ScanCard from '../ScanCard/index.component';
import SignUpBase from '../SignUpBase/index.component';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import type { CreateWalletType, IBaseGetGuardianProps } from '../types';
import CustomSvg from '../CustomSvg';
import clsx from 'clsx';
import { useUpdateEffect } from 'react-use';
import ConfigProvider from '../config-provider';
import { usePortkey } from '../context';
import { useSignHandler } from '../../hooks/useSignHandler';
import useMobile from '../../hooks/useMobile';
import './index.less';

export interface CryptoDesignProps extends IBaseGetGuardianProps {
  type?: CreateWalletType;
  onSignTypeChange?: (type: CreateWalletType) => void;
}

export default function CryptoDesignBaseCom({
  type,
  style,
  defaultChainId = 'AELF',
  className,
  isErrorTip = true,
  isShowScan: showScan = true,
  phoneCountry,
  extraElementList,
  termsOfService,
  privacyPolicy,
  loginMethodsOrder,
  recommendIndexes,
  onError,
  onSuccess,
  validateEmail,
  validatePhone,
  onSignTypeChange,
  onChainIdChange,
  onLoginFinishWithoutPin,
}: CryptoDesignProps) {
  const validateEmailRef = useRef<CryptoDesignProps['validateEmail']>(validateEmail);
  const validatePhoneRef = useRef<CryptoDesignProps['validatePhone']>(validatePhone);
  const onChainIdChangeRef = useRef<CryptoDesignProps['onChainIdChange']>(onChainIdChange);
  const onErrorRef = useRef<CryptoDesignProps['onError']>(onError);

  const _socialLogin = useMemo(() => ConfigProvider.getSocialLoginConfig(), []);
  const [{ theme }] = usePortkey();

  const isMobile = useMobile();

  useEffect(() => {
    validateEmailRef.current = validateEmail;
    validatePhoneRef.current = validatePhone;
    onChainIdChangeRef.current = onChainIdChange;
    onErrorRef.current = onError;
  });

  const [_type, setType] = useState<CreateWalletType>(type ?? 'Login');

  const [{ networkType, chainType }] = usePortkey();

  const LoginCardOnStep = useCallback((step: Omit<CreateWalletType, 'Login'>) => setType(step as CreateWalletType), []);

  const isShowScan = useMemo(
    () => (typeof showScan === 'undefined' ? Boolean(networkType && chainType) : showScan),
    [chainType, networkType, showScan],
  );

  useUpdateEffect(() => {
    onSignTypeChange?.(_type);
  }, [_type, onSignTypeChange]);

  const handlerParam = useMemo(
    () => ({
      defaultChainId,
      onError: onErrorRef.current,
      onSuccess,
      customValidateEmail: validateEmailRef.current,
      customValidatePhone: validatePhoneRef.current,
      onChainIdChange: onChainIdChangeRef.current,
    }),
    [defaultChainId, onSuccess],
  );
  const {
    validateEmail: _validateEmail,
    validatePhone: _validatePhone,
    onFinish,
    onSocialFinish,
  } = useSignHandler(handlerParam);

  const extra = useMemo(() => <>{extraElementList?.map((item) => item) ?? null}</>, [extraElementList]);

  return (
    <div className={clsx('signup-login-content', className)} style={style}>
      {_type === 'SignUp' && (
        <SignUpBase
          isErrorTip={isErrorTip}
          isMobile={isMobile}
          phoneCountry={phoneCountry}
          socialLogin={_socialLogin}
          extraElement={extra}
          termsOfService={termsOfService}
          privacyPolicy={privacyPolicy}
          networkType={networkType}
          loginMethodsOrder={loginMethodsOrder}
          recommendIndexes={recommendIndexes}
          onLoginByPortkey={onLoginFinishWithoutPin}
          validatePhone={_validatePhone}
          validateEmail={_validateEmail}
          onBack={() => setType('Login')}
          onInputFinish={onFinish}
          onError={onError}
          onSocialSignFinish={onSocialFinish}
        />
      )}
      {_type === 'LoginByScan' && (
        <ScanCard
          chainId={defaultChainId}
          isMobile={isMobile}
          backIcon={<CustomSvg type="PC" />}
          chainType={chainType}
          networkType={networkType}
          onBack={() => setType('Login')}
          onFinish={onLoginFinishWithoutPin}
          isErrorTip={isErrorTip}
          onError={onError}
        />
      )}
      {_type === 'Login' && (
        <LoginCard
          theme={theme}
          isMobile={isMobile}
          isErrorTip={isErrorTip}
          phoneCountry={phoneCountry}
          socialLogin={_socialLogin}
          isShowScan={isShowScan}
          extraElement={extra}
          termsOfService={termsOfService}
          privacyPolicy={privacyPolicy}
          networkType={networkType}
          loginMethodsOrder={loginMethodsOrder}
          recommendIndexes={recommendIndexes}
          onLoginByPortkey={onLoginFinishWithoutPin}
          onInputFinish={onFinish}
          validatePhone={_validatePhone}
          validateEmail={_validateEmail}
          onStep={LoginCardOnStep}
          onSocialLoginFinish={onSocialFinish}
          onError={onError}
        />
      )}
    </div>
  );
}
