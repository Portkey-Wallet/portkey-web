import { AccountType, AccountTypeEnum } from '@portkey/services';
import { Tabs, TabsProps } from 'antd';
import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { ValidatorHandler } from '../../types';
import EmailTab from '../EmailTab';
import PhoneTab from '../PhoneTab';
import { IPhoneCountry } from '../types';
import { GuardianInputInfo } from '../types/signIn';
import './index.less';

export interface InputInfoProps {
  confirmText: string;
  phoneCountry?: IPhoneCountry;
  defaultActiveKey?: AccountType;
  validateEmail?: ValidatorHandler;
  validatePhone?: ValidatorHandler;
  onFinish?: (v: GuardianInputInfo) => void;
}

export interface InputInfoRef {
  setActiveKey: (key: AccountType) => void;
}

const InputInfo = forwardRef(
  (
    { confirmText, phoneCountry, defaultActiveKey = 'Phone', onFinish, validateEmail, validatePhone }: InputInfoProps,
    ref,
  ) => {
    const [activeKey, setActiveKey] = useState<AccountType>(defaultActiveKey);

    useImperativeHandle(
      ref,
      () => ({
        setActiveKey,
      }),
      [],
    );

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
        <Tabs activeKey={activeKey} items={items} onChange={setActiveKey as any} />
      </div>
    );
  },
);

export default InputInfo;
