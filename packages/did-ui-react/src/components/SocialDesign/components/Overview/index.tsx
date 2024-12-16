import { AccountType } from '@portkey/services';
import DividerCenter from '../../../DividerCenter';
import CustomSvg from '../../../CustomSvg';
import TermsOfServiceItem from '../../../TermsOfServiceItem';
import './index.less';
import { TotalAccountType } from '../../../../types';
import { TotalAccountsInfo } from '../../../../constants/socialLogin';
import { ReactElement, useMemo, useRef, useState } from 'react';
import { useComputeIconCountPreRow } from '../../../../hooks/login';
import clsx from 'clsx';
import { TotalAccountTypeList } from '../../../../constants/guardian';
import LoginIconAndLabel from '../../../LoginIconAndLabel';
import { BlockLoginButton, CircleLoginButton } from '../../../LoginButton';

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
  // const guardiansGroupRef = useRef<HTMLDivElement>(null);
  // const [isFold, setIsFold] = useState(true);

  // const { isNeedFold, iconMinWidthRealGap, expendDisplayList, defaultDisplayList } =
  //   useComputeIconCountPreRow<TotalAccountType>({
  //     ref: guardiansGroupRef,
  //     accountList: loginMethodsOrder,
  //     supportList: TotalAccountTypeList,
  //     minLoginAccountIconWidth: 40,
  //     minIconGap: MinIconGap,
  //   });

  console.log(loginMethodsOrder, TotalAccountTypeList);
  const loginMethodsOrderWithoutGoogle = loginMethodsOrder.filter((ele) => ele !== 'Google');
  const bottomExtraEle = useMemo(() => extraElementList?.slice(1).map((item) => <>{item}</>), [extraElementList]);

  return (
    <div className="portkey-ui-flex-column portkey-ui-user-input-overview">
      <div className="portkey-ui-flex-1 portkey-ui-flex-column">
        <div className="user-input-extra-ele">
          {extraElementList?.[0] ? extraElementList?.[0] : <LoginIconAndLabel />}
        </div>
        <DividerCenter />
        {/* <div ref={guardiansGroupRef} className="portkey-ui-flex-center portkey-ui-account-type-wrapper">
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
        </div> */}
        <BlockLoginButton onClickCallback={() => onAccountTypeChange?.('Google')} iconType="Google" iconName="Google" />
        <div className="portkey-ui-social-login-circle-icon-wrapper">
          {loginMethodsOrderWithoutGoogle.map((item) => {
            return (
              <CircleLoginButton
                key={item}
                iconType={TotalAccountsInfo[item].icon}
                onClickCallback={() => onAccountTypeChange?.(item)}
              />
            );
          })}
        </div>

        {bottomExtraEle && bottomExtraEle.length > 0 && (
          <div className="portkey-ui-flex-1  user-input-bottom-extra-ele">{bottomExtraEle}</div>
        )}
      </div>

      {termsOfService && <TermsOfServiceItem termsOfService={termsOfService} privacyPolicy={privacyPolicy} />}
    </div>
  );
}
