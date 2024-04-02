import { useMemo, useRef, useEffect, ReactNode, useCallback, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import {
  ISocialLogin,
  ISocialLoginConfig,
  IWeb2Login,
  NetworkType,
  OnErrorFunc,
  RegisterType,
  SocialLoginFinishHandler,
  TotalAccountType,
} from '../../types';
import CustomSvg from '../CustomSvg';
import DividerCenter from '../DividerCenter';
import AccountRecommendGroup from '../AccountRecommendGroup';
import TermsOfServiceItem from '../TermsOfServiceItem';
import { CreateWalletType, LoginFinishWithoutPin, Theme } from '../types';
import useSocialLogin from '../../hooks/useSocialLogin';
import { errorTip, handleErrorMessage, setLoading } from '../../utils';
import './index.less';
import { TotalAccountsInfo } from '../../constants/socialLogin';
import { AccountLoginList, SocialLoginList, Web2LoginList } from '../../constants/guardian';
import { AccountType } from '@portkey/services';
import { useComputeIconCountPreRow } from '../../hooks/login';
import UpgradedPortkeyTip from '../UpgradedPortkeyTip';
import { getAccessTokenInDappTelegram, getTelegramStartParam } from '../../utils/telegram';

interface SocialLoginProps {
  type: RegisterType;
  theme?: Theme;
  isMobile?: boolean;
  className?: string;
  isShowScan?: boolean;
  socialLogin?: ISocialLoginConfig;
  termsOfService?: ReactNode;
  privacyPolicy?: string;
  extraElement?: ReactNode; // extra element
  networkType: NetworkType;
  loginMethodsOrder?: TotalAccountType[];
  recommendIndexes?: number[];
  onBack?: () => void;
  onFinish?: SocialLoginFinishHandler;
  switchGuardianType?: (type: IWeb2Login) => void;
  switchType?: (type: CreateWalletType) => void;
  onLoginByPortkey?: LoginFinishWithoutPin;

  isErrorTip?: boolean;
  onError?: OnErrorFunc;
}

const MinIconGap = 16;

export default function SocialLogin({
  type,
  className,
  isShowScan,
  socialLogin,
  isMobile = false,
  networkType,
  extraElement,
  termsOfService,
  privacyPolicy,
  isErrorTip,
  loginMethodsOrder,
  recommendIndexes,
  onBack,
  onFinish,
  onError,
  switchGuardianType,
  onLoginByPortkey,
  switchType,
}: SocialLoginProps) {
  const { t } = useTranslation();
  const onBackRef = useRef<SocialLoginProps['onBack']>(onBack);
  const onFinishRef = useRef<SocialLoginProps['onFinish']>(onFinish);

  const onErrorRef = useRef<SocialLoginProps['onError']>(onError);
  const switchGuardianTypeRef = useRef<SocialLoginProps['switchGuardianType']>(switchGuardianType);
  const switchTypeRef = useRef<SocialLoginProps['switchType']>(switchType);
  useEffect(() => {
    onBackRef.current = onBack;
    onFinishRef.current = onFinish;
    switchGuardianTypeRef.current = switchGuardianType;
    switchTypeRef.current = switchType;
    onErrorRef.current = onError;
  });
  const socialLoginHandler = useSocialLogin({ socialLogin, network: networkType });

  const isLogin = useMemo(() => type === 'Login', [type]);

  const onSocialChange = useCallback(
    async (type: ISocialLogin) => {
      try {
        setLoading(true);
        // const storageKey = `${isLogin ? PORTKEY_SIGN_IN_STORAGE_KEY : PORTKEY_SIGN_UP_STORAGE_KEY}_Telegram`;

        const result = await socialLoginHandler(type);
        setLoading(false);
        onFinishRef.current?.(result);
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
    [isErrorTip, socialLoginHandler],
  );

  const handleLoginAfterAuthWithInTelegram = useCallback(async () => {
    // TODO tg test
    const { startParam } = getTelegramStartParam();
    // const startParam = '1712052456778_38986';
    console.log('====startParam', startParam);
    if (startParam) {
      clearInterval(timerRef.current);
      const decodeResult = await getAccessTokenInDappTelegram(startParam);
      console.log('===res.data', decodeResult);

      // get AccessToken from socket
      const result = {
        type: 'Telegram' as ISocialLogin,
        data: {
          accessToken: decodeResult || '',
        },
      };
      console.log('=== result', result);
      onFinishRef.current?.(result);
    }
  }, []);

  const timerRef = useRef<NodeJS.Timer | number>();
  useEffect(() => {
    console.log('=== useEffect setInterval', '');
    // TODO tg
    timerRef.current = setInterval(() => {
      handleLoginAfterAuthWithInTelegram();
    }, 2000);

    return () => {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    };
  }, [handleLoginAfterAuthWithInTelegram]);

  const recommendList = useMemo(() => {
    if (Array.isArray(recommendIndexes)) {
      return recommendIndexes?.map((item) => loginMethodsOrder?.[item]);
    } else {
      return SocialLoginList;
    }
  }, [loginMethodsOrder, recommendIndexes]);

  const notRecommendList = useMemo(() => {
    if (Array.isArray(recommendIndexes)) {
      return loginMethodsOrder?.filter((_item, index) => {
        return !recommendIndexes?.includes(index);
      });
    } else {
      return Web2LoginList;
    }
  }, [loginMethodsOrder, recommendIndexes]);

  const notRecommendGroupRef = useRef<HTMLDivElement>(null);
  const [isFold, setIsFold] = useState(true);

  const {
    isNeedFold,
    iconMinWidthRealGap,
    expendDisplayList: notRecommendExpendDisplayList,
    defaultDisplayList: notRecommendDefaultDisplayList,
  } = useComputeIconCountPreRow<TotalAccountType>({
    ref: notRecommendGroupRef,
    accountList: notRecommendList as TotalAccountType[],
    supportList: AccountLoginList,
    minLoginAccountIconWidth: 48,
    minIconGap: MinIconGap,
  });

  const handleNotRecommendChange = useCallback(
    (item: string) => {
      if (SocialLoginList.includes(item)) {
        onSocialChange(item as ISocialLogin);
        return;
      }
      switchGuardianTypeRef?.current?.(item as IWeb2Login);
    },
    [onSocialChange],
  );

  const notRecommendUI = useMemo(() => {
    return (
      <div
        ref={notRecommendGroupRef}
        className="portkey-ui-flex-center portkey-ui-extra-guardian-type-content"
        style={{
          columnGap: isNeedFold ? iconMinWidthRealGap : MinIconGap,
          rowGap: MinIconGap,
          justifyContent: isNeedFold && !isFold ? 'flex-start' : 'center',
        }}>
        {notRecommendDefaultDisplayList?.map(
          (item) =>
            item !== 'Scan' && (
              <div
                className="icon-wrapper portkey-ui-flex-center"
                key={item}
                onClick={() => handleNotRecommendChange(item)}>
                <CustomSvg type={TotalAccountsInfo[item].icon} />
              </div>
            ),
        )}

        {!isFold &&
          notRecommendExpendDisplayList?.map(
            (item) =>
              item !== 'Scan' && (
                <div
                  className="icon-wrapper portkey-ui-flex-center"
                  key={item}
                  onClick={() => handleNotRecommendChange(item)}>
                  <CustomSvg type={TotalAccountsInfo[item].icon} />
                </div>
              ),
          )}

        {isNeedFold && (
          <div className="icon-wrapper portkey-ui-flex-center">
            <CustomSvg
              className={clsx('portkey-ui-flex-center', !isFold && 'expand-account')}
              type={'ArrowDown'}
              onClick={() => setIsFold(!isFold)}
            />
          </div>
        )}
      </div>
    );
  }, [
    handleNotRecommendChange,
    iconMinWidthRealGap,
    isFold,
    isNeedFold,
    notRecommendDefaultDisplayList,
    notRecommendExpendDisplayList,
  ]);

  return (
    <>
      <div
        className={clsx(
          'portkey-ui-flex-column',
          'social-login-wrapper',
          isMobile && 'social-login-mobile-wrapper',
          className,
        )}>
        {isLogin && <UpgradedPortkeyTip className="social-login-upgraded-portkey" />}
        <h1 className="portkey-ui-flex-between-center font-medium social-login-title">
          {!isLogin && <CustomSvg type="BackLeft" onClick={onBackRef?.current} />}
          {isLogin && <span></span>}
          <div className={clsx('title')}>
            {isMobile ? (
              <>
                <CustomSvg type="Portkey" style={{ width: '56px', height: '56px' }} />
                {t(type)}
              </>
            ) : (
              t(type)
            )}
          </div>
          {isLogin && isShowScan && <CustomSvg type="QRCode" onClick={() => switchTypeRef?.current?.('LoginByScan')} />}
          {!isLogin && !isMobile && <span className="empty"></span>}
        </h1>
        <div className="portkey-ui-flex-column portkey-ui-flex-1 social-login-content">
          <AccountRecommendGroup
            accountTypeList={recommendList as AccountType[] | undefined}
            networkType={networkType}
            socialLogin={socialLogin}
            type={type}
            onSocialChange={onSocialChange}
            onWeb2Change={(type) => {
              switchGuardianTypeRef?.current?.(type);
            }}
            onLoginByPortkey={onLoginByPortkey}
          />
          <DividerCenter />

          {notRecommendUI}

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

      <TermsOfServiceItem termsOfService={termsOfService} privacyPolicy={privacyPolicy} />
    </>
  );
}
