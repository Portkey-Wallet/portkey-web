import clsx from 'clsx';
import CustomSvg from '../CustomSvg';
import { ISocialLogin } from '../../types';
import { useMemo, useState } from 'react';
import './index.less';
import { TotalAccountsInfo } from '../../constants/socialLogin';
import { SocialLoginList } from '../../constants/guardian';

interface SocialLoginGroupProps {
  supportAccounts?: Array<ISocialLogin>;
  isShowScan?: boolean;
  className?: string;
  onAccountTypeChange?: (type: ISocialLogin) => void;
}

export default function SocialLoginGroup({
  supportAccounts = SocialLoginList as ISocialLogin[],
  isShowScan = true,
  className,
  onAccountTypeChange,
}: SocialLoginGroupProps) {
  const isNeedFold = useMemo(() => supportAccounts?.length > 5, [supportAccounts?.length]);
  const [isFold, setIsFold] = useState(true);
  const defaultDisplayList = useMemo(
    () => (supportAccounts?.length > 5 ? supportAccounts?.slice(0, 4) : supportAccounts),
    [supportAccounts],
  );

  const expendDisplayList = useMemo(
    () => (supportAccounts?.length > 5 ? supportAccounts?.slice(4, supportAccounts?.length) : []),
    [supportAccounts],
  );

  return (
    <div className={clsx('social-icon-group-wrapper', className)}>
      <div className="portkey-ui-flex-start-center account-type-list">
        {defaultDisplayList.map(
          (item) =>
            SocialLoginList.includes(item) && (
              <CustomSvg
                className="portkey-ui-flex-center"
                key={TotalAccountsInfo[item].type}
                type={TotalAccountsInfo[item].icon}
                onClick={() => onAccountTypeChange?.(TotalAccountsInfo[item].type as ISocialLogin)}
              />
            ),
        )}
        {isNeedFold && (
          <CustomSvg
            className={clsx('portkey-ui-flex-center', !isFold && 'expand-account')}
            type={'ArrowDown'}
            onClick={() => setIsFold(!isFold)}
          />
        )}
        {!isFold &&
          expendDisplayList.map(
            (item) =>
              (TotalAccountsInfo[item].type !== 'Scan' || (TotalAccountsInfo[item].type === 'Scan' && isShowScan)) && (
                <CustomSvg
                  className="portkey-ui-flex-center"
                  key={TotalAccountsInfo[item].type}
                  type={TotalAccountsInfo[item].icon}
                  onClick={() => onAccountTypeChange?.(TotalAccountsInfo[item].type as ISocialLogin)}
                />
              ),
          )}
      </div>
    </div>
  );
}
