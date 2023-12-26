import { Segmented } from 'antd';
import { useState } from 'react';
import PhoneTab from '../PhoneTab';
import { GuardianInputInfo, IPhoneCountry } from '../types';
import { AccountType, AccountTypeEnum } from '@portkey-v1/services';
import { ValidatorHandler } from '../../types';
import EmailTab from '../EmailTab';
import './index.less';

export interface InputInfoProps {
  confirmText: string;
  phoneCountry?: IPhoneCountry;
  defaultActiveKey?: AccountType;
  validateEmail?: ValidatorHandler;
  validatePhone?: ValidatorHandler;
  onFinish?: (v: GuardianInputInfo) => void;
}

export default function SegmentedInput({
  confirmText,
  phoneCountry,
  defaultActiveKey = 'Phone',
  onFinish,
  validateEmail,
  validatePhone,
}: InputInfoProps) {
  const [value, setValue] = useState<AccountType>(defaultActiveKey);
  return (
    <div className="portkey-ui-segmented-input">
      <Segmented
        className="portkey-ui-segmented"
        value={value}
        block
        options={['Phone', 'Email']}
        onChange={(v) => setValue(v as any)}
      />
      {value === 'Phone' && (
        <PhoneTab
          className="portkey-ui-segmented-phone"
          confirmText={confirmText}
          phoneCountry={phoneCountry}
          validate={validatePhone}
          onFinish={(v) =>
            onFinish?.({
              accountType: AccountTypeEnum[AccountTypeEnum.Phone] as AccountType,
              identifier: `+${v.code} ${v.phoneNumber}`,
            })
          }
        />
      )}
      {value === 'Email' && (
        <EmailTab
          className="portkey-ui-segmented-email"
          confirmText={confirmText}
          validate={validateEmail}
          onFinish={(v) =>
            onFinish?.({
              accountType: AccountTypeEnum[AccountTypeEnum.Email] as AccountType,
              identifier: v,
            })
          }
        />
      )}
    </div>
  );
}
