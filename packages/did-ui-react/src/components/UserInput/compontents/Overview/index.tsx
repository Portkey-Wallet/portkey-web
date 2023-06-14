import { AccountType } from '@portkey/services';
import DividerCenter from '../../../DividerCenter';
import './index.less';
import CustomSvg from '../../../CustomSvg';
import TermsOfServiceItem from '../../../TermsOfServiceItem';

export interface OverviewProps {
  extraElement?: React.ReactNode;
  isShowScan?: boolean;
  termsOfService?: React.ReactNode;

  onAccountTypeChange?: (type: AccountType | 'Scan') => void;
}

type IAccountItem = {
  type: AccountType | 'Scan';
  name: string;
  icon: string;
};
const accountTypeList: IAccountItem[] = [
  { type: 'Google', name: 'Google', icon: 'Google' },
  { type: 'Apple', name: 'Apple', icon: 'Apple' },
  { type: 'Email', name: 'Email', icon: 'EmailIcon' },
  { type: 'Phone', name: 'Phone', icon: 'PhoneIcon' },
  { type: 'Scan', name: 'Scan', icon: 'QRCodeIcon' },
];

export default function Overview({ isShowScan, extraElement, termsOfService, onAccountTypeChange }: OverviewProps) {
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
            {accountTypeList.map(
              (item) =>
                (item.type !== 'Scan' || (item.type === 'Scan' && isShowScan)) && (
                  <CustomSvg
                    className="portkey-ui-flex-center"
                    key={item.type}
                    type={item.icon as any}
                    onClick={() => onAccountTypeChange?.(item.type)}
                  />
                ),
            )}
          </div>
        </div>
      </div>

      <TermsOfServiceItem termsOfService={termsOfService} />
    </div>
  );
}
