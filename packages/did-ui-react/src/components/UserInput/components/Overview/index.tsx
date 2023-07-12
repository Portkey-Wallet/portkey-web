import { AccountType } from '@portkey/services';
import DividerCenter from '../../../DividerCenter';
import './index.less';
import CustomSvg from '../../../CustomSvg';
import TermsOfServiceItem from '../../../TermsOfServiceItem';
import { Theme } from '../../../types';
import { useMemo } from 'react';

export interface OverviewProps {
  theme?: Theme;
  extraElement?: React.ReactNode;
  isShowScan?: boolean;
  termsOfService?: React.ReactNode;

  onAccountTypeChange?: (type: AccountType | 'Scan') => void;
}

type IAccountItem = {
  type: AccountType | 'Scan';
  name: string;
};

const themeIconList = [
  ['Google', 'GuardianGoogle'],
  ['Apple', 'GuardianApple'],
  ['EmailIcon', 'Email'],
  ['PhoneIcon', 'GuardianPhone'],
  ['QRCodeIcon', 'QRCodeIcon'],
];

const accountTypeList: IAccountItem[] = [
  { type: 'Google', name: 'Google' },
  { type: 'Apple', name: 'Apple' },
  { type: 'Email', name: 'Email' },
  { type: 'Phone', name: 'Phone' },
  { type: 'Scan', name: 'Scan' },
];

export default function Overview({
  theme,
  isShowScan,
  extraElement,
  termsOfService,
  onAccountTypeChange,
}: OverviewProps) {
  const iconIndex = useMemo(() => (theme === 'dark' ? 1 : 0), [theme]);
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
              (item, index) =>
                (item.type !== 'Scan' || (item.type === 'Scan' && isShowScan)) && (
                  <CustomSvg
                    className="portkey-ui-flex-center"
                    key={item.type}
                    type={themeIconList[index][iconIndex] as any}
                    onClick={() => onAccountTypeChange?.(item.type)}
                  />
                ),
            )}
          </div>
        </div>
      </div>

      {termsOfService && <TermsOfServiceItem termsOfService={termsOfService} />}
    </div>
  );
}
