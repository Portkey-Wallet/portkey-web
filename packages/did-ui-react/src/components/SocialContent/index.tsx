import { Button } from 'antd';
import clsx from 'clsx';
import { useMemo } from 'react';
import { ISocialLogin, ISocialLoginConfig, RegisterType, TotalAccountType } from '../../types';
import CustomSvg from '../CustomSvg';
import { LoginFinishWithoutPin, Theme } from '../types';
import WakeUpPortkey from '../WakeUpPortkey';
import { devices } from '@portkey/utils';
import './index.less';
import { TotalAccountTypeList } from '../../constants/socialLogin';

export interface ShowSocialType {
  showGoogle?: boolean;
  showApple?: boolean;
  showTelegram?: boolean;
}

interface SocialContentProps extends ShowSocialType {
  type: RegisterType;
  theme?: Theme;
  socialLogin?: ISocialLoginConfig;
  networkType?: string;
  className?: string;
  accountTypeList?: TotalAccountType[];
  onSocialChange?: (type: ISocialLogin) => void;
  onLoginByPortkey?: LoginFinishWithoutPin;
}

export default function SocialContent({
  type,
  theme,
  socialLogin,
  showGoogle = true,
  showApple = true,
  showTelegram = true,
  accountTypeList = TotalAccountTypeList,
  networkType,
  className,
  onSocialChange,
  onLoginByPortkey,
}: SocialContentProps) {
  const isMobile = useMemo(() => {
    try {
      return devices.isMobileDevices();
    } catch (error) {
      return false;
    }
  }, []);

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
      {accountTypeList?.map((recommend) => {
        return (
          <>
            {recommend === 'Google' && showGoogle && (
              <Button className={clsx('social-login-btn')} onClick={() => onSocialChange?.('Google')}>
                {theme === 'dark' ? <CustomSvg type="GuardianGoogle" /> : <CustomSvg type="Google" />}
                <span>{`${type} with Google`}</span>
                <span className="empty"></span>
              </Button>
            )}
            {recommend === 'Apple' && showApple && (
              <Button className={clsx('social-login-btn')} onClick={() => onSocialChange?.('Apple')}>
                {theme === 'dark' ? <CustomSvg type="GuardianApple" /> : <CustomSvg type="Apple" />}
                <span>{`${type} with Apple`}</span>
                <span className="empty"></span>
              </Button>
            )}
            {recommend === 'Telegram' && showTelegram && (
              <Button className={clsx('social-login-btn')} onClick={() => onSocialChange?.('Telegram')}>
                {theme === 'dark' ? <CustomSvg type="TelegramLogin" /> : <CustomSvg type="TelegramLogin" />}
                <span> {`${type} with Telegram`}</span>
                <span className="empty"></span>
              </Button>
            )}
          </>
        );
      })}
    </div>
  );
}
