import { Button } from 'antd';
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
    (type: AccountType) => {
      return (
        <Button
          className={clsx('recommend-login-btn')}
          onClick={() => {
            if (Web2LoginList.includes(type)) {
              onWeb2Change?.(type as IWeb2Login);
            } else if (SocialLoginList.includes(type)) {
              onSocialChange?.(type as ISocialLogin);
            }
          }}>
          <CustomSvg type={AccountsInfo[type].icon} />
          <span>{`${type} with ${AccountsInfo[type].name}`}</span>
          <span className="empty"></span>
        </Button>
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
