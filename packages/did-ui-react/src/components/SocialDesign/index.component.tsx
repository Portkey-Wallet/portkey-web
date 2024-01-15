import { memo, useMemo, useState, useCallback, useRef } from 'react';
import { IBaseGetGuardianProps } from '../types';
import { AccountType } from '@portkey-v1/services';
import Overview from './components/Overview';
import ScanCard from '../ScanCard/index.component';
import CustomSvg from '../CustomSvg';
import InputLogin from '../InputLogin';
import { errorTip, handleErrorMessage, setLoading } from '../../utils';
import ConfigProvider from '../config-provider';
import useSocialLogin from '../../hooks/useSocialLogin';
import clsx from 'clsx';
import { usePortkey } from '../context';
import { useSignHandler } from '../../hooks/useSignHandler';
import './index.less';
import useMobile from '../../hooks/useMobile';
import { SocialLoginList } from '../../constants/guardian';

type SocialDesignType = AccountType | 'Scan' | null;
export interface SocialDesignProps extends IBaseGetGuardianProps {
  type?: SocialDesignType;
}

function SocialDesign({
  style,
  type = null,
  defaultChainId = 'AELF',
  className,
  isErrorTip = true,
  isShowScan: showScan = true,
  phoneCountry,
  extraElement,
  termsOfService,
  privacyPolicy,
  loginMethodsOrder,
  onError,
  onSuccess,
  validateEmail: defaultValidateEmail,
  validatePhone: defaultValidatePhone,
  onChainIdChange,
  onLoginFinishWithoutPin,
}: SocialDesignProps) {
  const [accountType, setAccountType] = useState<SocialDesignType>(type);
  const validateEmailRef = useRef<SocialDesignProps['validateEmail']>(defaultValidateEmail);
  const validatePhoneRef = useRef<SocialDesignProps['validatePhone']>(defaultValidatePhone);
  const onChainIdChangeRef = useRef<SocialDesignProps['onChainIdChange']>(onChainIdChange);
  const onErrorRef = useRef<SocialDesignProps['onError']>(onError);
  const [{ networkType, chainType }] = usePortkey();

  const socialLogin = useMemo(() => ConfigProvider.getSocialLoginConfig(), []);

  const socialLoginHandler = useSocialLogin({ socialLogin, network: networkType });

  const isMobile = useMobile();

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
  const { validateEmail, validatePhone, onFinish, onSocialFinish } = useSignHandler(handlerParam);

  const onAccountTypeChange = useCallback(
    async (type: AccountType | 'Scan') => {
      try {
        if (!SocialLoginList.includes(type)) return setAccountType(type);
        let result;
        setLoading(true);

        if (type === 'Google') {
          result = await socialLoginHandler('Google');
        } else if (type === 'Apple') {
          result = await socialLoginHandler('Apple');
        } else if (type === 'Telegram') {
          result = await socialLoginHandler('Telegram');
        } else throw Error('AccountType is not support');
        setLoading(false);

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
    [isErrorTip, onSocialFinish, socialLoginHandler],
  );

  return (
    <div className={clsx('portkey-ui-user-input-wrapper', className)} style={style}>
      {accountType === 'Scan' && (
        <ScanCard
          isMobile={isMobile}
          chainId={defaultChainId}
          backIcon={<CustomSvg type="PC" />}
          chainType={chainType}
          networkType={networkType}
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
          privacyPolicy={privacyPolicy}
          loginMethodsOrder={loginMethodsOrder}
        />
      )}
    </div>
  );
}

export default memo(SocialDesign);
