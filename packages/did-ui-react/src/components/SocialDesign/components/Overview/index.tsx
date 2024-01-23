import { AccountType } from '@portkey-v1/services';
import DividerCenter from '../../../DividerCenter';
import CustomSvg from '../../../CustomSvg';
import TermsOfServiceItem from '../../../TermsOfServiceItem';
import './index.less';
import { TotalAccountType } from '../../../../types';
import { TotalAccountsInfo } from '../../../../constants/socialLogin';
import { useRef, useState } from 'react';
import { useComputeIconCountPreRow } from '../../../../hooks/login';
import clsx from 'clsx';
import SwitchUpgradedPortkey from '../../../SwitchUpgradedPortkey';
import { TotalAccountTypeList } from '../../../../constants/guardian';

export interface OverviewProps {
  extraElement?: React.ReactNode;
  isShowScan?: boolean;
  termsOfService?: React.ReactNode;
  privacyPolicy?: string;
  loginMethodsOrder?: TotalAccountType[];
  recommendIndexes?: number[];
  upgradedPortkey?: () => void;
  onAccountTypeChange?: (type: AccountType | 'Scan') => void;
}

const MinIconGap = 12;

export default function Overview({
  isShowScan,
  extraElement,
  termsOfService,
  privacyPolicy,
  loginMethodsOrder = TotalAccountTypeList,
  upgradedPortkey,
  onAccountTypeChange,
}: OverviewProps) {
  const guardiansGroupRef = useRef<HTMLDivElement>(null);
  const [isFold, setIsFold] = useState(true);

  const { isNeedFold, iconRealGap, expendDisplayList, defaultDisplayList } =
    useComputeIconCountPreRow<TotalAccountType>({
      ref: guardiansGroupRef,
      accountList: loginMethodsOrder,
      minLoginAccountIconWidth: 40,
      minIconGap: MinIconGap,
    });

  return (
    <div className="portkey-ui-flex-column portkey-ui-user-input-overview">
      <div className="portkey-ui-flex-1 portkey-ui-flex-column">
        <div className="portkey-ui-flex-1 user-input-extra-ele">
          {extraElement ? (
            extraElement
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
              gap: isNeedFold ? iconRealGap : MinIconGap,
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
      </div>

      {termsOfService && <TermsOfServiceItem termsOfService={termsOfService} privacyPolicy={privacyPolicy} />}
      <SwitchUpgradedPortkey onClick={upgradedPortkey} />
    </div>
  );
}
