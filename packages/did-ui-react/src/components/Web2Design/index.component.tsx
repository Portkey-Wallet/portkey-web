import SegmentedInput from '../SegmentedInput';
import {
  CreateWalletType,
  GuardianInputInfo,
  IGuardianIdentifierInfo,
  IPhoneCountry,
  LoginFinishWithoutPin,
  TSize,
} from '../types';
import { OnErrorFunc, RegisterType, SocialLoginFinishHandler, ValidatorHandler } from '../../types';
import DividerCenter from '../DividerCenter';
import SocialContent from '../SocialContent';
import { useState, useMemo, CSSProperties, ReactNode, useCallback, useEffect, useRef } from 'react';
import { ChainId } from '@portkey/types';
import useNetworkList from '../../hooks/useNetworkList';
import ConfigProvider from '../config-provider';
import clsx from 'clsx';
import ScanCard from '../ScanCard/index.component';
import TermsOfServiceItem from '../TermsOfServiceItem';
import {
  did,
  getGoogleUserInfo,
  handleErrorCode,
  handleErrorMessage,
  parseAppleIdentityToken,
  setLoading,
} from '../../utils';
import { AccountType, AccountTypeEnum } from '@portkey/services';
import './index.less';
import { isMobileDevices } from '../../utils/isMobile';
import CustomSvg from '../CustomSvg';
import useMedia from '../../hooks/useMedia';
import { usePortkey } from '../context';

export interface Web2DesignProps {
  type?: CreateWalletType;
  defaultChainId?: ChainId;
  className?: string;
  size?: TSize;
  style?: CSSProperties;
  isErrorTip?: boolean;
  isShowScan?: boolean; // show scan button
  termsOfService?: ReactNode;
  phoneCountry?: IPhoneCountry; // phone country code info
  extraElement?: ReactNode; // extra element
  onError?: OnErrorFunc;
  validateEmail?: ValidatorHandler; // validate email
  validatePhone?: ValidatorHandler; // validate phone
  onSignTypeChange?: (type: CreateWalletType) => void;
  onSuccess?: (value: IGuardianIdentifierInfo) => void;
  onLoginFinishWithoutPin?: LoginFinishWithoutPin; // Only for scan
  onChainIdChange?: (value?: ChainId) => void; // When defaultChainId changed
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

  const onSwitch = useCallback(() => {
    setType((v) => {
      const nextType = v === 'Login' ? 'Sign up' : 'Login';
      onSignTypeChange?.(nextType === 'Sign up' ? 'SignUp' : 'Login');

      return nextType;
    });
  }, [onSignTypeChange]);

  const validateIdentifier = useCallback(async (identifier?: string): Promise<any> => {
    let isLoginGuardian = false;
    try {
      const { originChainId } = await did.services.getRegisterInfo({
        loginGuardianIdentifier: identifier,
      });

      const payload = await did.getHolderInfo({
        loginGuardianIdentifier: identifier,
        chainId: originChainId,
      });
      if (payload?.guardianList?.guardians?.length > 0) {
        isLoginGuardian = true;
      }
    } catch (error: any) {
      if (handleErrorCode(error) === '3002') {
        isLoginGuardian = false;
      } else {
        throw handleErrorMessage(error || 'GetHolderInfo error');
      }
    }

    isHasAccount.current = isLoginGuardian;
  }, []);

  const _validateEmail = useCallback(
    async (email?: string) => {
      setLoading(true, 'Checking account on the chain...');
      await validateIdentifier(email);
      return validateEmailRef?.current?.(email);
    },
    [validateIdentifier],
  );

  const _validatePhone = useCallback(
    async (phone?: string) => {
      setLoading(true, 'Checking account on the chain...');
      await validateIdentifier(phone?.replaceAll(/\s/g, ''));
      return validatePhoneRef?.current?.(phone);
    },
    [validateIdentifier],
  );

  const getIdentifierChainId = useCallback(
    async (identifier: string) => {
      let _originChainId = defaultChainId;

      try {
        const { originChainId } = await did.services.getRegisterInfo({
          loginGuardianIdentifier: identifier.replaceAll(/\s/g, ''),
        });
        _originChainId = originChainId;
      } catch (error: any) {
        _originChainId = defaultChainId;
      }
      return _originChainId;
    },
    [defaultChainId],
  );
  const isHasAccount = useRef<boolean>(false);

  const onFinish = useCallback(
    async (value: GuardianInputInfo) => {
      setLoading(true);
      const chainId = await getIdentifierChainId(value.identifier.replaceAll(/\s/g, ''));
      onChainIdChangeRef?.current?.(chainId);
      setLoading(false);
      onSuccess?.({ ...value, isLoginGuardian: isHasAccount.current, chainId });
    },
    [getIdentifierChainId, onSuccess],
  );

  const onSocialFinish: SocialLoginFinishHandler = useCallback(
    async ({ type, data }) => {
      try {
        setLoading(true, 'Checking account on the chain...');
        if (!data) throw 'Action error';
        if (type === 'Google') {
          const userInfo = await getGoogleUserInfo(data?.accessToken);
          if (!userInfo?.id) throw userInfo;
          await validateIdentifier(userInfo.id);
          onFinish({
            identifier: userInfo.id,
            accountType: AccountTypeEnum[AccountTypeEnum.Google] as AccountType,
            authenticationInfo: { googleAccessToken: data?.accessToken },
          });
        } else if (type === 'Apple') {
          const userInfo = parseAppleIdentityToken(data?.accessToken);
          if (userInfo) {
            await validateIdentifier(userInfo.userId);
            onFinish({
              identifier: userInfo.userId,
              accountType: AccountTypeEnum[AccountTypeEnum.Apple] as AccountType,
              authenticationInfo: { appleIdToken: data?.accessToken },
            });
          } else {
            throw 'Authorization failed';
          }
        } else {
          throw Error(`AccountType:${type} is not support`);
        }
      } catch (error) {
        setLoading(false);

        const msg = handleErrorMessage(error);
        onErrorRef?.current?.({
          errorFields: 'onSocialFinish',
          error: msg,
        });
      }
    },
    [onFinish, validateIdentifier],
  );

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
