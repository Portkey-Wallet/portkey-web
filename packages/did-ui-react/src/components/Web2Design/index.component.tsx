import SegmentedInput from '../SegmentedInput';
import { CreateWalletType, IBaseGetGuardianProps, TSize } from '../types';
import { RegisterType } from '../../types';
import DividerCenter from '../DividerCenter';
import SocialContent from '../SocialContent';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import useNetworkList from '../../hooks/useNetworkList';
import ConfigProvider from '../config-provider';
import clsx from 'clsx';
import ScanCard from '../ScanCard/index.component';
import TermsOfServiceItem from '../TermsOfServiceItem';
import { isMobileDevices } from '../../utils/isMobile';
import CustomSvg from '../CustomSvg';
import useMedia from '../../hooks/useMedia';
import { usePortkey } from '../context';
import './index.less';
import useSignHandler from '../SignStep/utils';

export interface Web2DesignProps extends IBaseGetGuardianProps {
  type?: CreateWalletType;
  size?: TSize;
  onSignTypeChange?: (type: CreateWalletType) => void;
}

export default function Web2Design({
  style,
  defaultChainId = 'AELF',
  className,
  size,
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
}: Web2DesignProps) {
  const [type, setType] = useState<RegisterType>('Login');

  const { network, networkList } = useNetworkList();
  const [{ theme }] = usePortkey();
  const validateEmailRef = useRef<Web2DesignProps['validateEmail']>(validateEmail);
  const validatePhoneRef = useRef<Web2DesignProps['validatePhone']>(validatePhone);
  const onChainIdChangeRef = useRef<Web2DesignProps['onChainIdChange']>(onChainIdChange);
  const onErrorRef = useRef<Web2DesignProps['onError']>(onError);

  useEffect(() => {
    validateEmailRef.current = validateEmail;
    validatePhoneRef.current = validatePhone;
    onChainIdChangeRef.current = onChainIdChange;
    onErrorRef.current = onError;
  });

  const isWide = useMedia('(max-width: 768px)');

  const littleSize = useMemo(() => {
    try {
      if (size === 'L') return false;
      if (size === 'S') return true;
      return isWide || isMobileDevices();
    } catch (error) {
      return false;
    }
  }, [isWide, size]);

  const socialLogin = useMemo(() => ConfigProvider.getSocialLoginConfig(), []);

  const currentNetwork = useMemo(
    () => networkList?.find((item) => item.networkType === network),
    [network, networkList],
  );
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

  const onSwitch = useCallback(() => {
    setType((v) => {
      const nextType = v === 'Login' ? 'Sign up' : 'Login';
      onSignTypeChange?.(nextType === 'Sign up' ? 'SignUp' : 'Login');

      return nextType;
    });
  }, [onSignTypeChange]);

  const leftWrapper = useMemo(
    () => (
      <div className="portkey-ui-flex-1 left-wrapper">
        <h1 className="web2design-title">{type}</h1>
        <SegmentedInput
          phoneCountry={phoneCountry}
          defaultActiveKey={'Phone'}
          validatePhone={_validatePhone}
          validateEmail={_validateEmail}
          confirmText={type}
          onFinish={onFinish}
        />
        <DividerCenter />
        <SocialContent
          theme={theme}
          className="portkey-ui-web2design-social-login"
          isErrorTip={isErrorTip}
          networkType={network}
          socialLogin={socialLogin}
          type={type}
          onFinish={onSocialFinish}
          onLoginByPortkey={onLoginFinishWithoutPin}
          onError={onError}
        />
        {extraElement}
        <div className="portkey-ui-web2design-switch-sign">
          {type === 'Login' ? (
            <>
              No Account?&nbsp;
              <span className="btn-text" onClick={onSwitch}>
                Sign up now
              </span>
            </>
          ) : (
            <>
              Already have an account?&nbsp;
              <span className="btn-text" onClick={onSwitch}>
                Log in
              </span>
            </>
          )}
        </div>
        {termsOfService && <TermsOfServiceItem termsOfService={termsOfService} />}
      </div>
    ),
    [
      _validateEmail,
      _validatePhone,
      extraElement,
      isErrorTip,
      network,
      onError,
      onFinish,
      onLoginFinishWithoutPin,
      onSocialFinish,
      onSwitch,
      phoneCountry,
      socialLogin,
      termsOfService,
      theme,
      type,
    ],
  );

  const rightWrapper = useMemo(
    () => (
      <div className="portkey-ui-flex-center right-wrapper">
        {showScan && (
          <ScanCard
            gridType={1}
            chainId={defaultChainId}
            chainType={currentNetwork?.walletType}
            networkType={network}
            onBack={() => setType('Login')}
            onFinish={onLoginFinishWithoutPin}
            isErrorTip={isErrorTip}
            onError={onError}
          />
        )}
      </div>
    ),
    [currentNetwork?.walletType, defaultChainId, isErrorTip, network, onError, onLoginFinishWithoutPin, showScan],
  );
  const [showQRCode, setShowQRCode] = useState<boolean>();

  return (
    <div className="portkey-ui-web2design-wrapper">
      {type === 'Login' && littleSize && (
        <>
          {!showQRCode ? (
            <CustomSvg className="web2design-qrcode-icon" type="QRCode" onClick={() => setShowQRCode(true)} />
          ) : (
            <CustomSvg className="web2design-qrcode-icon" type="PC" onClick={() => setShowQRCode(false)} />
          )}
        </>
      )}
      <div
        className={clsx(
          type === 'Login' && 'portkey-ui-flex-between portkey-ui-web2design-login',
          'portkey-ui-web2design-login-wrapper',
          littleSize && 'portkey-ui-web2design-login-little-screen',
          className,
        )}
        style={style}>
        {!littleSize ? (
          <>
            {leftWrapper}
            {type === 'Login' && rightWrapper}
          </>
        ) : (
          <>
            {!showQRCode && leftWrapper}
            {type === 'Login' && showQRCode && rightWrapper}
          </>
        )}
      </div>
    </div>
  );
}
