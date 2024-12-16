import { useMemo, useRef, useEffect, ReactNode, useCallback, useState, ReactElement } from 'react';
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
import { SocialLoginList, TotalAccountTypeList, Web2LoginList } from '../../constants/guardian';
import { AccountType } from '@portkey/services';
import { useComputeIconCountPreRow } from '../../hooks/login';
import UpgradedPortkeyTip from '../UpgradedPortkeyTip';
import { TAllLoginKey } from '../../utils/googleAnalytics';
import { usePortkey } from '../context';
import LoginIconAndLabel from '../LoginIconAndLabel';
import { CircleLoginButton } from '../LoginButton';

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
  onSocialStart?: (type: TAllLoginKey) => void;
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
  onSocialStart,
  switchType,
}: SocialLoginProps) {
  const [{ theme }] = usePortkey();
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
        onSocialStart?.(type);
        console.log('🌈 🌈 🌈 🌈 🌈 🌈 16', '');
        setLoading(true);
        const result = await socialLoginHandler(type);
        setLoading(false);
        if (result) {
          onFinishRef.current?.(result);
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
    [isErrorTip, onSocialStart, socialLoginHandler],
  );

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
    supportList: TotalAccountTypeList,
    minLoginAccountIconWidth: 48,
    minIconGap: MinIconGap,
  });

  const handleNotRecommendChange = useCallback(
    (item: string) => {
      console.log('item', item);
      if (SocialLoginList.includes(item)) {
        onSocialChange(item as ISocialLogin);
        return;
      }
      if (item === 'Scan') {
        switchTypeRef?.current?.('LoginByScan');
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
          gap: 32,
          // columnGap: isNeedFold ? iconMinWidthRealGap : MinIconGap,
          // rowGap: MinIconGap,
          justifyContent: isNeedFold && !isFold ? 'flex-start' : 'center',
        }}>
        {notRecommendDefaultDisplayList?.map((item) => (
          <CircleLoginButton
            key={item}
            onClickCallback={() => handleNotRecommendChange(item)}
            iconType={TotalAccountsInfo[item].icon}
          />
        ))}

        {!isFold &&
          notRecommendExpendDisplayList?.map((item) => (
            <CircleLoginButton
              key={item}
              onClickCallback={() => handleNotRecommendChange(item)}
              iconType={TotalAccountsInfo[item].icon}
            />
          ))}

        {isNeedFold && (
          <CircleLoginButton
            className={clsx(!isFold && 'expand-account')}
            onClickCallback={() => setIsFold(!isFold)}
            iconType="ArrowDown"
          />
        )}
      </div>
    );
  }, [handleNotRecommendChange, isFold, isNeedFold, notRecommendDefaultDisplayList, notRecommendExpendDisplayList]);

  console.log('extraElement', extraElement);
  return (
    <>
      <div
        className={clsx(
          'portkey-ui-flex-column',
          'social-login-wrapper',
          isMobile && 'social-login-mobile-wrapper',
          className,
        )}>
        {/* {isLogin && <UpgradedPortkeyTip className="social-login-upgraded-portkey" />} */}
        {/* <h1 className="portkey-ui-flex-between-center font-medium social-login-title">
          {!isLogin && <CustomSvg type="BackLeft" onClick={onBackRef?.current} />}
          {isLogin && <span></span>}
          <div className={clsx('title')}>
            <CustomSvg type="Portkey" style={{ width: '48px', height: '48px' }} />
            <span>{t('Log in to Portkey')}</span>
          </div>
          {isLogin && isShowScan && <CustomSvg type="QRCode" onClick={() => switchTypeRef?.current?.('LoginByScan')} />}
          {!isLogin && !isMobile && <span className="empty"></span>}
        </h1> */}
        <LoginIconAndLabel />
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

          {(extraElement as ReactElement)?.props?.children && (
            <>
              <DividerCenter />
              {extraElement}
            </>
          )}

          {/* {isLogin && (
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
          )} */}
        </div>
      </div>

      <TermsOfServiceItem termsOfService={termsOfService} privacyPolicy={privacyPolicy} />
    </>
  );
}
