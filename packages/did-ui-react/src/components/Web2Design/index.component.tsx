import SegmentedInput from '../SegmentedInput';
import { CreateWalletType, GuardianInputInfo, IBaseGetGuardianProps, TSize } from '../types';
import { ISocialLogin, RegisterType, TotalAccountType } from '../../types';
import DividerCenter from '../DividerCenter';
import { useState, useMemo, useCallback, useEffect, useRef, ReactElement } from 'react';
import ConfigProvider from '../config-provider';
import clsx from 'clsx';
import ScanCard from '../ScanCard/index.component';
import TermsOfServiceItem from '../TermsOfServiceItem';
import CustomSvg from '../CustomSvg';
import useMedia from '../../hooks/useMedia';
import { usePortkey } from '../context';
import './index.less';
import { useUpdateEffect } from 'react-use';
import { useSignHandler } from '../../hooks/useSignHandler';
import { devices } from '@portkey/utils';
import useMobile from '../../hooks/useMobile';
import { errorTip, handleErrorMessage, setLoading } from '../../utils';
import useSocialLogin from '../../hooks/useSocialLogin';
import SocialLoginGroup from '../SocialLoginGroup';
import { SocialLoginList, Web2LoginList } from '../../constants/guardian';
import UpgradedPortkeyTip from '../UpgradedPortkeyTip';
import LoginIconAndLabel from '../LoginIconAndLabel';

export interface Web2DesignProps extends IBaseGetGuardianProps {
  type?: CreateWalletType;
  size?: TSize;
  loginMethodsOrder?: TotalAccountType[];
  onSignTypeChange?: (type: CreateWalletType) => void;
}

export default function Web2Design({
  type: mode,
  style,
  defaultChainId = 'AELF',
  className,
  size,
  isErrorTip = true,
  isShowScan: showScan = true,
  phoneCountry,
  extraElementList,
  termsOfService,
  privacyPolicy,
  loginMethodsOrder,
  onError,
  onClose,
  onSuccess,
  validateEmail,
  validatePhone,
  onSignTypeChange,
  onChainIdChange,
  onSocialStart,
  onInputConfirmStart,
  onLoginFinishWithoutPin,
}: Web2DesignProps) {
  console.log('loginMethodsOrder', loginMethodsOrder);
  const signType = useMemo(() => (mode === 'SignUp' ? 'Sign up' : 'Login'), [mode]);
  const [type, setType] = useState<RegisterType>(signType || 'Login');

  useUpdateEffect(() => {
    setType(signType);
  }, [signType]);

  const [{ networkType, chainType }] = usePortkey();
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

  const isMobile = useMobile();

  const littleSize = useMemo(() => {
    console.log('wfs====size', size);
    try {
      if (size === 'L') return false;
      if (size === 'S') return true;
      return isWide || devices.isMobileDevices();
    } catch (error) {
      return false;
    }
  }, [isWide, size]);

  const socialLogin = useMemo(() => ConfigProvider.getSocialLoginConfig(), []);

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

  const socialLoginHandler = useSocialLogin({ socialLogin, network: networkType });

  const onSocialChange = useCallback(
    async (type: ISocialLogin) => {
      try {
        onSocialStart?.(type);
        if (!SocialLoginList.includes(type)) return setShowQRCode(true);
        if (Web2LoginList.includes(type)) throw Error('Please try social account');

        setLoading(true);
        console.log('🌈 🌈 🌈 🌈 🌈 🌈 17', '');
        const result = await socialLoginHandler(type as ISocialLogin);
        setLoading(false);
        if (result) {
          onSocialFinish?.(result);
        }
      } catch (error) {
        setLoading(false);
        errorTip(
          {
            errorFields: `socialLogin ${type}`,
            error: handleErrorMessage(error),
          },
          isErrorTip,
          onErrorRef.current,
        );
      }
    },
    [isErrorTip, onSocialFinish, onSocialStart, socialLoginHandler],
  );

  const onInputFinish = useCallback(
    (data: GuardianInputInfo) => {
      onInputConfirmStart?.();
      onFinish(data);
    },
    [onFinish, onInputConfirmStart],
  );

  const extraElement = useMemo(
    () => (type == 'Sign up' ? <>{extraElementList?.[0] ?? null}</> : <>{extraElementList?.map((item) => item)}</>),
    [extraElementList, type],
  );

  const loginMethodsOrderWithoutEmail = loginMethodsOrder?.filter((ele) => ele !== 'Email');

  const leftWrapper = useMemo(
    () => (
      <div className="portkey-ui-flex-1 portkey-ui-flex-column left-wrapper">
        <div className="portkey-ui-flex-1">
          <LoginIconAndLabel />
          <SegmentedInput
            phoneCountry={phoneCountry}
            defaultActiveKey={'Phone'}
            validatePhone={_validatePhone}
            validateEmail={_validateEmail}
            confirmText={type}
            onFinish={onInputFinish}
          />

          <div
            className={clsx(
              'portkey-ui-web2design-switch-sign',
              type === 'Sign up' && 'portkey-ui-web2design-switch-sign-sign-up',
            )}>
            {type === 'Login' ? (
              <>
                Don’t have an account?&nbsp;
                <span className="btn-text" onClick={onSwitch}>
                  Sign up
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
          <DividerCenter />

          {/* <div className="portkey-ui-web2design-social-wrapper">
            <SocialLoginGroup supportAccounts={loginMethodsOrderWithoutEmail} onAccountTypeChange={onSocialChange} />
          </div> */}

          {(extraElement as ReactElement)?.props?.children && (
            <>
              <DividerCenter />
              {extraElement}
            </>
          )}
        </div>
        {termsOfService && <TermsOfServiceItem termsOfService={termsOfService} privacyPolicy={privacyPolicy} />}
      </div>
    ),
    [
      _validateEmail,
      _validatePhone,
      extraElement,
      loginMethodsOrderWithoutEmail,
      onInputFinish,
      onSocialChange,
      onSwitch,
      phoneCountry,
      privacyPolicy,
      termsOfService,
      type,
    ],
  );

  const rightWrapper = useMemo(
    () => (
      <div className="portkey-ui-flex-center right-wrapper">
        {showScan && (
          <ScanCard
            gridType={0}
            isMobile={isMobile}
            chainId={defaultChainId}
            chainType={chainType}
            networkType={networkType}
            onShowQrCode={() => onSocialStart?.('Scan')}
            onBack={() => {
              setType('Login');
              setShowQRCode(false);
            }}
            onFinish={onLoginFinishWithoutPin}
            isErrorTip={isErrorTip}
            onError={onError}
            onClose={onClose}
          />
        )}
      </div>
    ),
    [
      chainType,
      defaultChainId,
      isErrorTip,
      isMobile,
      networkType,
      onClose,
      onError,
      onLoginFinishWithoutPin,
      onSocialStart,
      showScan,
    ],
  );
  const [showQRCode, setShowQRCode] = useState<boolean>();
  return (
    <div className="portkey-ui-web2design-wrapper">
      {/* {type === 'Login' && littleSize && !showQRCode && (
        <CustomSvg className="web2design-qrcode-icon" type="QRCode" onClick={() => setShowQRCode(true)} />
      )} */}
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
