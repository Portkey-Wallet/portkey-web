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
import useSignHandler from '../SignStep/utils';
import './index.less';

export interface SignUpAndLoginProps extends IBaseGetGuardianProps {
  type?: CreateWalletType;
  onSignTypeChange?: (type: CreateWalletType) => void;
}

export default function SignUpAndLoginBaseCom({
  type,
  style,
  defaultChainId = 'AELF',
  className,
  isErrorTip = true,
  isShowScan: showScan = true,
  phoneCountry,
  extraElement,
  termsOfService,
  onError,
  onSuccess,
  validateEmail,
  validatePhone,
  onSignTypeChange,
  onChainIdChange,
  onLoginFinishWithoutPin,
}: SignUpAndLoginProps) {
  const validateEmailRef = useRef<SignUpAndLoginProps['validateEmail']>(validateEmail);
  const validatePhoneRef = useRef<SignUpAndLoginProps['validatePhone']>(validatePhone);
  const onChainIdChangeRef = useRef<SignUpAndLoginProps['onChainIdChange']>(onChainIdChange);
  const onErrorRef = useRef<SignUpAndLoginProps['onError']>(onError);

  const _socialLogin = useMemo(() => ConfigProvider.getSocialLoginConfig(), []);
  const [{ theme }] = usePortkey();

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

  return (
    <div className={clsx('signup-login-content', className)} style={style}>
      {_type === 'SignUp' && (
        <SignUpBase
          isErrorTip={isErrorTip}
          phoneCountry={phoneCountry}
          socialLogin={_socialLogin}
          extraElement={extraElement}
          termsOfService={termsOfService}
          networkType={networkType}
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
          isErrorTip={isErrorTip}
          phoneCountry={phoneCountry}
          socialLogin={_socialLogin}
          isShowScan={isShowScan}
          extraElement={extraElement}
          termsOfService={termsOfService}
          networkType={networkType}
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
