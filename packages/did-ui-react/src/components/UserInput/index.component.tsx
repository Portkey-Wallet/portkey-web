import { ChainId } from '@portkey/types';
import { CSSProperties, ReactNode, memo, useMemo, useState, useCallback, useRef } from 'react';
import { GuardianInputInfo, IPhoneCountry, LoginFinishWithoutPin, SignInSuccess } from '../types';
import { ISocialLoginConfig, OnErrorFunc, SocialLoginFinishHandler, ValidatorHandler } from '../../types';
import { AccountType, AccountTypeEnum } from '@portkey/services';
import Overview from './compontents/Overview';
import ScanCard from '../ScanCard/index.component';
import CustomSvg from '../CustomSvg';
import useNetworkList from '../../hooks/useNetworkList';
import InputLogin from '../InputLogin';
import {
  did,
  errorTip,
  getGoogleUserInfo,
  handleErrorCode,
  handleErrorMessage,
  parseAppleIdentityToken,
  setLoading,
} from '../../utils';
import ConfigProvider from '../config-provider';
import useSocialLogin from '../../hooks/useSocialLogin';
import clsx from 'clsx';
import './index.less';
import { useUpdateEffect } from 'react-use';

export interface UserInputProps {
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
  // onSignTypeChange?: (type: CreateWalletType) => void;
  onSuccess?: (value: SignInSuccess) => void;
  onLoginFinishWithoutPin?: LoginFinishWithoutPin; // Only for scan
  onNetworkChange?: (network: string) => void; // When network changed
  onChainIdChange?: (value?: ChainId) => void; // When defaultChainId changed
}
function UserInput({
  style,
  defaultChainId = 'AELF',
  className,
  isErrorTip = true,
  isShowScan: showScan = true,
  phoneCountry,
  appleIdToken,
  socialLogin: defalutSocialLogin,
  extraElement,
  termsOfService,
  onError,
  onSuccess,
  validateEmail: defaultValidateEmail,
  validatePhone: defaultValidatePhone,
  // onNetworkChange,
  onChainIdChange,
  onLoginFinishWithoutPin,
}: UserInputProps) {
  const [accountType, setAccountType] = useState<AccountType | 'Scan' | null>(null);
  const validateEmailRef = useRef<UserInputProps['validateEmail']>(defaultValidateEmail);
  const validatePhoneRef = useRef<UserInputProps['validatePhone']>(defaultValidatePhone);
  const onChainIdChangeRef = useRef<UserInputProps['onChainIdChange']>(onChainIdChange);
  const onErrorRef = useRef<UserInputProps['onError']>(onError);

  const socialLogin = useMemo(() => defalutSocialLogin || ConfigProvider.getSocialLoginConfig(), [defalutSocialLogin]);

  const { loginByApple, loginByGoogle } = useSocialLogin({ socialLogin });

  const { network, networkList } = useNetworkList();

  const currentNetwork = useMemo(
    () => networkList?.find((item) => item.networkType === network),
    [network, networkList],
  );

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

  const validateEmail = useCallback(
    async (email?: string) => {
      setLoading(true, 'Checking account on the chain...');
      await validateIdentifier(email);
      return validateEmailRef?.current?.(email);
    },
    [validateIdentifier],
  );

  const validatePhone = useCallback(
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

  const onFinish = useCallback(
    async (value: GuardianInputInfo) => {
      setLoading(true);
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

        errorTip(
          {
            errorFields: 'onSocialFinish',
            error: handleErrorMessage(error),
          },
          isErrorTip,
          onErrorRef.current,
        );
      }
    },
    [isErrorTip, onFinish, validateIdentifier],
  );

  const onAccountTypeChange = useCallback(
    async (type: AccountType | 'Scan') => {
      try {
        if (type !== 'Apple' && type !== 'Google') return setAccountType(type);
        let result;
        if (type === 'Google') {
          setLoading(true);
          result = await loginByGoogle();
        } else if (type === 'Apple') {
          setLoading(true);
          result = await loginByApple();
        } else throw Error('AccountType is not support');
        await onSocialFinish(result);
      } catch (error) {
        setLoading(false);
        errorTip(
          {
            errorFields: 'onAccountTypeChange',
            error: handleErrorMessage(error),
          },
          isErrorTip,
          onErrorRef.current,
        );
      }
    },
    [isErrorTip, loginByApple, loginByGoogle, onSocialFinish],
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
    <div className={clsx('portkey-ui-user-input-wrapper', className)} style={style}>
      {accountType === 'Scan' && (
        <ScanCard
          chainId={defaultChainId}
          backIcon={<CustomSvg type="PC" />}
          chainType={currentNetwork?.walletType}
          networkType={network}
          onBack={() => setAccountType(null)}
          onFinish={onLoginFinishWithoutPin}
          isErrorTip={isErrorTip}
          onError={onError}
        />
      )}
      {(accountType === 'Email' || accountType === 'Phone') && (
        <InputLogin
          type="Login"
          className="user-input-login"
          defaultAccountType={accountType}
          phoneCountry={phoneCountry}
          validateEmail={validateEmail}
          validatePhone={validatePhone}
          onFinish={onFinish}
          onBack={() => setAccountType(null)}
        />
      )}

      {!accountType && (
        <Overview
          isShowScan={showScan}
          extraElement={extraElement}
          onAccountTypeChange={onAccountTypeChange}
          termsOfService={termsOfService}
        />
      )}
    </div>
  );
}

export default memo(UserInput);
