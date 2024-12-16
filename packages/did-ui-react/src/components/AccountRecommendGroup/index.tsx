import clsx from 'clsx';
import { useCallback, useMemo } from 'react';
import { ISocialLogin, ISocialLoginConfig, IWeb2Login, RegisterType } from '../../types';
import CustomSvg from '../CustomSvg';
import { LoginFinishWithoutPin } from '../types';
import WakeUpPortkey from '../WakeUpPortkey';
import { devices } from '@portkey/utils';
import './index.less';
import { AccountsInfo } from '../../constants/socialLogin';
import { AccountLoginList, SocialLoginList, Web2LoginList } from '../../constants/guardian';
import { AccountType } from '@portkey/services';
import ThrottleButton from '../ThrottleButton';
import { BlockLoginButton } from '../LoginButton';

interface AccountRecommendGroupProps {
  type: RegisterType;
  socialLogin?: ISocialLoginConfig;
  networkType?: string;
  className?: string;
  accountTypeList?: AccountType[];
  onSocialChange?: (type: ISocialLogin) => void;
  onWeb2Change?: (type: IWeb2Login) => void;
  onLoginByPortkey?: LoginFinishWithoutPin;
}

export default function AccountRecommendGroup({
  type,
  socialLogin,
  accountTypeList = AccountLoginList as AccountType[],
  networkType,
  className,
  onSocialChange,
  onWeb2Change,
  onLoginByPortkey,
}: AccountRecommendGroupProps) {
  const isMobile = useMemo(() => {
    try {
      return devices.isMobileDevices();
    } catch (error) {
      return false;
    }
  }, []);

  const renderLoginElement = useCallback(
    (accountType: AccountType) => {
      return (
        <BlockLoginButton
          onClickCallback={() => {
            if (Web2LoginList.includes(accountType)) {
              onWeb2Change?.(accountType as IWeb2Login);
            } else if (SocialLoginList.includes(accountType)) {
              onSocialChange?.(accountType as ISocialLogin);
            }
          }}
          iconType={AccountsInfo[accountType].icon}
          iconName={AccountsInfo[accountType].name}
          key={'Portkey_ui_renderLoginElement' + accountType}
        />
        // <ThrottleButton
        //   className={clsx('recommend-login-btn')}
        //   onClick={() => {
        //     if (Web2LoginList.includes(accountType)) {
        //       onWeb2Change?.(accountType as IWeb2Login);
        //     } else if (SocialLoginList.includes(accountType)) {
        //       onSocialChange?.(accountType as ISocialLogin);
        //     }
        //   }}
        //   key={'Portkey_ui_renderLoginElement' + accountType}>
        //   <CustomSvg type={AccountsInfo[accountType].icon} fillColor={theme === 'light' ? '#1F1F21' : '#FFFFFF'} />
        //   <span>{`${type} with ${AccountsInfo[accountType].name}`}</span>
        //   <span className="empty"></span>
        // </ThrottleButton>
      );
    },
    [onSocialChange, onWeb2Change],
  );

  return (
    <div className={clsx('social-content-wrapper', className)}>
      {socialLogin?.Portkey && type !== 'Sign up' && isMobile && (
        <WakeUpPortkey
          type={type}
          networkType={networkType}
          websiteInfo={socialLogin?.Portkey}
          onFinish={onLoginByPortkey}
        />
      )}
      {accountTypeList?.map((account) => {
        return renderLoginElement(account);
      })}
    </div>
  );
}
