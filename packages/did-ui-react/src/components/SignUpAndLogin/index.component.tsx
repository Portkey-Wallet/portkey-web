import LoginCard from '../LoginBase/index.component';
import ScanCard from '../ScanCard/index.component';
import SignUpBase from '../SignUpBase/index.component';
import { useState, useMemo, useRef, useCallback, useEffect, CSSProperties, ReactNode } from 'react';
import type { CreateWalletType, LoginFinishWithoutPin } from '../types';
import CustomSvg from '../CustomSvg';
import clsx from 'clsx';
import { useUpdateEffect } from 'react-use';
import { OnErrorFunc, ISocialLoginConfig, SocialLoginFinishHandler, ValidatorHandler } from '../../types';
import useNetworkList from '../../hooks/useNetworkList';
import { ChainId } from '@portkey/types';
import {
  did,
  handleErrorCode,
  getGoogleUserInfo,
  handleErrorMessage,
  parseAppleIdentityToken,
  setLoading,
} from '../../utils';
import { GuardianInputInfo, SignInSuccess } from '../types';
import type { IPhoneCountry } from '../types';
import { AccountType, AccountTypeEnum } from '@portkey/services';
import ConfigProvider from '../config-provider';
import './index.less';

export interface SignUpAndLoginProps {
  type?: CreateWalletType;
  defaultChainId?: ChainId;
  className?: string;
  style?: CSSProperties;
  isErrorTip?: boolean;
  isShowScan?: boolean; // show scan button
  termsOfService?: ReactNode;
  phoneCountry?: IPhoneCountry; // phone country code info
  extraElement?: ReactNode; // extra element
  // socialLogin porps
  socialLogin?: ISocialLoginConfig; // social login config
  appleIdToken?: string; // apple authorized
  //
  onError?: OnErrorFunc;
  validateEmail?: ValidatorHandler; // validate email
  validatePhone?: ValidatorHandler; // validate phone
  onSignTypeChange?: (type: CreateWalletType) => void;
  onSuccess?: (value: SignInSuccess) => void;
  onLoginFinishWithoutPin?: LoginFinishWithoutPin; // Only for scan
  onNetworkChange?: (network: string) => void; // When network changed
  onChainIdChange?: (value?: ChainId) => void; // When defaultChainId changed
}

export default function SignUpAndLoginBaseCom({
  type,
  style,
  defaultChainId = 'AELF',
  className,
  isErrorTip = true,
  isShowScan: showScan = true,
  phoneCountry,
  socialLogin,
  appleIdToken,
  extraElement,
  termsOfService,
  onError,
  onSuccess,
  validateEmail,
  validatePhone,
  onSignTypeChange,
  onNetworkChange,
  onChainIdChange,
  onLoginFinishWithoutPin,
}: SignUpAndLoginProps) {
  const validateEmailRef = useRef<SignUpAndLoginProps['validateEmail']>(validateEmail);
  const validatePhoneRef = useRef<SignUpAndLoginProps['validatePhone']>(validatePhone);
  const onChainIdChangeRef = useRef<SignUpAndLoginProps['onChainIdChange']>(onChainIdChange);
  const onErrorRef = useRef<SignUpAndLoginProps['onError']>(onError);

  const _socialLogin = useMemo(() => socialLogin || ConfigProvider.getSocialLoginConfig(), [socialLogin]);

  useEffect(() => {
    validateEmailRef.current = validateEmail;
    validatePhoneRef.current = validatePhone;
    onChainIdChangeRef.current = onChainIdChange;
    onErrorRef.current = onError;
  });

  const [_type, setType] = useState<CreateWalletType>(type ?? 'Login');

  const { network, networkList } = useNetworkList();

  const LoginCardOnStep = useCallback((step: Omit<CreateWalletType, 'Login'>) => setType(step as CreateWalletType), []);

  const currentNetwork = useMemo(
    () => networkList?.find((item) => item.networkType === network),
    [network, networkList],
  );

  const isShowScan = useMemo(
    () =>
      typeof showScan === 'undefined' ? Boolean(currentNetwork?.networkType && currentNetwork.walletType) : showScan,
    [currentNetwork, showScan],
  );

  useUpdateEffect(() => {
    onSignTypeChange?.(_type);
  }, [_type, onSignTypeChange]);

  const isHasAccount = useRef<boolean>(false);

  const validateIdentifier = useCallback(async (identifier?: string): Promise<any> => {
    let isLoginIdentifier = false;
    try {
      const { originChainId } = await did.services.getRegisterInfo({
        loginGuardianIdentifier: identifier,
      });

      const payload = await did.getHolderInfo({
        loginGuardianIdentifier: identifier,
        chainId: originChainId,
      });
      if (payload?.guardianList?.guardians?.length > 0) {
        isLoginIdentifier = true;
      }
    } catch (error: any) {
      if (handleErrorCode(error) === '3002') {
        isLoginIdentifier = false;
      } else {
        throw handleErrorMessage(error || 'GetHolderInfo error');
      }
    }

    isHasAccount.current = isLoginIdentifier;
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

  const _onSuccess = useCallback(
    async (value: GuardianInputInfo) => {
      const chainId = await getIdentifierChainId(value.identifier.replaceAll(/\s/g, ''));
      onChainIdChangeRef?.current?.(chainId);
      setLoading(false);
      onSuccess?.({ ...value, isLoginIdentifier: isHasAccount.current, chainId });
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
          _onSuccess({
            identifier: userInfo.id,
            accountType: AccountTypeEnum[AccountTypeEnum.Google] as AccountType,
            authenticationInfo: { googleAccessToken: data?.accessToken },
          });
        } else if (type === 'Apple') {
          const userInfo = parseAppleIdentityToken(data?.accessToken);
          if (userInfo) {
            await validateIdentifier(userInfo.userId);
            _onSuccess({
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
    [_onSuccess, validateIdentifier],
  );

  useUpdateEffect(() => {
    try {
      if (appleIdToken) {
        const tokenInfo = parseAppleIdentityToken(appleIdToken);
        if (tokenInfo?.isExpired) return;
        onSocialFinish({ type: 'Apple', data: { accessToken: appleIdToken } });
      }
    } catch (error) {
      console.log(error, 'parseAppleIdentityToken');
    }
  }, [appleIdToken]);

  return (
    <div className={clsx('signup-login-content', className)} style={style}>
      {_type === 'SignUp' && (
        <SignUpBase
          isErrorTip={isErrorTip}
          phoneCountry={phoneCountry}
          socialLogin={_socialLogin}
          extraElement={extraElement}
          termsOfService={termsOfService}
          networkType={network}
          onLoginByPortkey={onLoginFinishWithoutPin}
          validatePhone={_validatePhone}
          validateEmail={_validateEmail}
          onBack={() => setType('Login')}
          onInputFinish={_onSuccess}
          onError={onError}
          onSocialSignFinish={onSocialFinish}
        />
      )}
      {_type === 'LoginByScan' && (
        <ScanCard
          chainId={defaultChainId}
          backIcon={<CustomSvg type="PC" />}
          chainType={currentNetwork?.walletType}
          networkType={network}
          onBack={() => setType('Login')}
          onFinish={onLoginFinishWithoutPin}
          isErrorTip={isErrorTip}
          onError={onError}
        />
      )}
      {_type === 'Login' && (
        <LoginCard
          isErrorTip={isErrorTip}
          phoneCountry={phoneCountry}
          socialLogin={_socialLogin}
          isShowScan={isShowScan}
          extraElement={extraElement}
          termsOfService={termsOfService}
          networkType={network}
          onLoginByPortkey={onLoginFinishWithoutPin}
          onInputFinish={_onSuccess}
          validatePhone={_validatePhone}
          validateEmail={_validateEmail}
          onStep={LoginCardOnStep}
          onSocialLoginFinish={onSocialFinish}
          onNetworkChange={onNetworkChange}
          onError={onError}
        />
      )}
    </div>
  );
}
