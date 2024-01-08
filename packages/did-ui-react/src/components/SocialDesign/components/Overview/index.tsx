import { AccountType } from '@portkey/services';
import DividerCenter from '../../../DividerCenter';
import CustomSvg from '../../../CustomSvg';
import TermsOfServiceItem from '../../../TermsOfServiceItem';
import './index.less';
import { TotalAccountType } from '../../../../types';
import { TotalAccountsInfo, TotalAccountTypeList } from '../../../../constants/socialLogin';

export interface OverviewProps {
  extraElement?: React.ReactNode;
  isShowScan?: boolean;
  termsOfService?: React.ReactNode;
  privacyPolicy?: string;
  loginMethodsOrder?: TotalAccountType[];
  recommendIndexes?: number[];
  onAccountTypeChange?: (type: AccountType | 'Scan') => void;
}

export default function Overview({
  isShowScan,
  extraElement,
  termsOfService,
  privacyPolicy,
  loginMethodsOrder = TotalAccountTypeList,
  onAccountTypeChange,
}: OverviewProps) {
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
        <div className="portkey-ui-flex-center portkey-ui-account-type-wrapper">
          <div className="portkey-ui-flex-center account-type-list">
            {loginMethodsOrder?.map(
              (item) =>
                (item !== 'Scan' || (item === 'Scan' && isShowScan)) && (
                  <CustomSvg
                    className="portkey-ui-flex-center"
                    key={item}
                    type={TotalAccountsInfo[item].icon as any}
                    onClick={() => onAccountTypeChange?.(item)}
                  />
                ),
            )}
          </div>
        </div>
      </div>

      {termsOfService && <TermsOfServiceItem termsOfService={termsOfService} privacyPolicy={privacyPolicy} />}
    </div>
  );
}
