import { useTranslation } from 'react-i18next';
import { RegisterType, ValidatorHandler } from '../../types';
import CustomSvg from '../CustomSvg';
import InputInfo, { InputInfoProps } from '../InputInfo';
import type { IPhoneCountry } from '../types';
import './index.less';
import { AccountType } from '@portkey-v1/services';
import clsx from 'clsx';

export default function InputLogin({
  type,
  className,
  phoneCountry,
  defaultAccountType,
  onBack,
  onFinish,
  validateEmail,
  validatePhone,
}: {
  type: RegisterType;
  className?: string;
  phoneCountry?: IPhoneCountry;
  defaultAccountType?: AccountType;
  onBack?: () => void;
  onFinish?: InputInfoProps['onFinish'];
  validateEmail?: ValidatorHandler;
  validatePhone?: ValidatorHandler;
}) {
  const { t } = useTranslation();

  return (
    <div className={clsx('login-content', className)}>
      <h1 className="portkey-ui-flex-between-center font-medium login-title">
        <CustomSvg type="BackLeft" onClick={onBack} />
        <span>{t(type)}</span>
        <span className="empty"></span>
      </h1>
      <InputInfo
        phoneCountry={phoneCountry}
        defaultActiveKey={defaultAccountType}
        validatePhone={validatePhone}
        validateEmail={validateEmail}
        confirmText={t(type)}
        onFinish={onFinish}
      />
    </div>
  );
}
