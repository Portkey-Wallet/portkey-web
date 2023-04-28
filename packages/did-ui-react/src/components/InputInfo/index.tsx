import { AccountType, AccountTypeEnum } from '@portkey/services';
import { Tabs, TabsProps } from 'antd';
import { useMemo } from 'react';
import { ValidatorHandler } from '../../types';
import EmailTab from '../EmailTab';
import PhoneTab from '../PhoneTab';
import { IPhoneCountry } from '../types';
import { GuardianInputInfo } from '../types/signIn';
import './index.less';

export interface InputInfoProps {
  confirmText: string;
  phoneCountry?: IPhoneCountry;
  validateEmail?: ValidatorHandler;
  validatePhone?: ValidatorHandler;
  onFinish?: (v: GuardianInputInfo) => void;
}

export default function InputInfo({
  confirmText,
  phoneCountry,
  onFinish,
  validateEmail,
  validatePhone,
}: InputInfoProps) {
  const items: TabsProps['items'] = useMemo(
    () => [
      {
        key: AccountTypeEnum[AccountTypeEnum.Phone],
        label: 'Phone',
        children: (
          <PhoneTab
            phoneCountry={phoneCountry}
            confirmText={confirmText}
            validate={validatePhone}
            onFinish={(v) =>
              onFinish?.({
                accountType: AccountTypeEnum[AccountTypeEnum.Phone] as AccountType,
                identifier: `+${v.code} ${v.phoneNumber}`,
              })
            }
          />
        ),
      },
      {
        key: AccountTypeEnum[AccountTypeEnum.Email],
        label: 'Email',
        children: (
          <EmailTab
            confirmText={confirmText}
            validate={validateEmail}
            onFinish={(v) =>
              onFinish?.({
                accountType: AccountTypeEnum[AccountTypeEnum.Email] as AccountType,
                identifier: v,
              })
            }
          />
        ),
      },
    ],
    [confirmText, onFinish, phoneCountry, validateEmail, validatePhone],
  );

  return (
    <div className="input-info-wrapper">
      <Tabs defaultActiveKey={AccountTypeEnum[AccountTypeEnum.Phone]} items={items} />
    </div>
  );
}
