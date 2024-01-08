import clsx from 'clsx';
import CustomSvg from '../CustomSvg';
import { ISocialLogin, TotalAccountType } from '../../types';
import { useMemo, useState } from 'react';
import './index.less';
import { TotalAccountsInfo, TotalAccountTypeList } from '../../constants/socialLogin';

interface AccountIconGroupProps {
  supportAccounts?: Array<TotalAccountType>;
  isShowScan?: boolean;
  className?: string;
  onAccountTypeChange?: (type: ISocialLogin) => void;
}

export default function AccountIconGroup({
  supportAccounts = TotalAccountTypeList,
  isShowScan = true,
  className,
  onAccountTypeChange,
}: AccountIconGroupProps) {
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
            (TotalAccountsInfo[item].type !== 'Scan' || (TotalAccountsInfo[item].type === 'Scan' && isShowScan)) && (
              <CustomSvg
                className="portkey-ui-flex-center"
                key={TotalAccountsInfo[item].type}
                type={TotalAccountsInfo[item].icon as any}
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
                  type={TotalAccountsInfo[item].icon as any}
                  onClick={() => onAccountTypeChange?.(TotalAccountsInfo[item].type as ISocialLogin)}
                />
              ),
          )}
      </div>
    </div>
  );
}
