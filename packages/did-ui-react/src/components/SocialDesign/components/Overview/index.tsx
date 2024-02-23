import { AccountType } from '@portkey/services';
import DividerCenter from '../../../DividerCenter';
import CustomSvg from '../../../CustomSvg';
import TermsOfServiceItem from '../../../TermsOfServiceItem';
import './index.less';
import { TotalAccountType } from '../../../../types';
import { TotalAccountsInfo } from '../../../../constants/socialLogin';
import { useMemo, useRef, useState } from 'react';
import { useComputeIconCountPreRow } from '../../../../hooks/login';
import clsx from 'clsx';
import UpgradedPortkeyTip from '../../../UpgradedPortkeyTip';
import { TotalAccountTypeList } from '../../../../constants/guardian';

export interface OverviewProps {
  extraElementList?: React.ReactNode[];
  isShowScan?: boolean;
  termsOfService?: React.ReactNode;
  privacyPolicy?: string;
  loginMethodsOrder?: TotalAccountType[];
  recommendIndexes?: number[];
  onAccountTypeChange?: (type: AccountType | 'Scan') => void;
}

const MinIconGap = 12;

export default function Overview({
  isShowScan,
  extraElementList,
  termsOfService,
  privacyPolicy,
  loginMethodsOrder = TotalAccountTypeList,
  onAccountTypeChange,
}: OverviewProps) {
  const guardiansGroupRef = useRef<HTMLDivElement>(null);
  const [isFold, setIsFold] = useState(true);

  const { isNeedFold, iconMinWidthRealGap, expendDisplayList, defaultDisplayList } =
    useComputeIconCountPreRow<TotalAccountType>({
      ref: guardiansGroupRef,
      accountList: loginMethodsOrder,
      supportList: TotalAccountTypeList,
      minLoginAccountIconWidth: 40,
      minIconGap: MinIconGap,
    });

  const bottomExtraEle = useMemo(() => extraElementList?.slice(1).map((item) => <>{item}</>), [extraElementList]);

  return (
    <div className="portkey-ui-flex-column portkey-ui-user-input-overview">
      <UpgradedPortkeyTip className="social-design-upgraded-portkey" />

      <div className="portkey-ui-flex-1 portkey-ui-flex-column">
        <div className="user-input-extra-ele">
          {extraElementList?.[0] ? (
            extraElementList?.[0]
          ) : (
            <div className="portkey-ui-flex-center default-extra-ele">
              <CustomSvg type="Portkey" />
            </div>
          )}
        </div>
        <DividerCenter />
        <div ref={guardiansGroupRef} className="portkey-ui-flex-center portkey-ui-account-type-wrapper">
          <div
            className="portkey-ui-flex-center account-type-list"
            style={{
              columnGap: isNeedFold ? iconMinWidthRealGap : MinIconGap,
              rowGap: MinIconGap,
              justifyContent: isNeedFold && !isFold ? 'flex-start' : 'center',
            }}>
            {defaultDisplayList?.map(
              (item) =>
                (item !== 'Scan' || (item === 'Scan' && isShowScan)) && (
                  <CustomSvg
                    className="portkey-ui-flex-center"
                    key={item}
                    type={TotalAccountsInfo[item].icon}
                    onClick={() => onAccountTypeChange?.(item)}
                  />
                ),
            )}

            {!isFold &&
              expendDisplayList?.map(
                (item) =>
                  (item !== 'Scan' || (item === 'Scan' && isShowScan)) && (
                    <CustomSvg
                      className="portkey-ui-flex-center"
                      key={item}
                      type={TotalAccountsInfo[item].icon}
                      onClick={() => onAccountTypeChange?.(item)}
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
          </div>
        </div>
        <div className="portkey-ui-flex-1  user-input-bottom-extra-ele">{bottomExtraEle}</div>
      </div>

      {termsOfService && <TermsOfServiceItem termsOfService={termsOfService} privacyPolicy={privacyPolicy} />}
    </div>
  );
}
