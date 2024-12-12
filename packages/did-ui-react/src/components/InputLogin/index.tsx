import { useTranslation } from 'react-i18next';
import { RegisterType, ValidatorHandler } from '../../types';
import CustomSvg from '../CustomSvg';
import EmailLogin, { EmailLoginProps } from '../EmailLogin';
import type { IPhoneCountry } from '../types';
import './index.less';
import { AccountType } from '@portkey/services';
import clsx from 'clsx';

export default function InputLogin({
  type,
  className,
  isLoading,
  onBack,
  onFinish,
  validateEmail,
}: {
  type: RegisterType;
  className?: string;
  isLoading?: boolean;
  phoneCountry?: IPhoneCountry; // deprecated
  defaultAccountType?: AccountType; // deprecated
  onBack?: () => void;
  onFinish?: EmailLoginProps['onFinish'];
  validateEmail?: ValidatorHandler;
  validatePhone?: ValidatorHandler; // deprecated
}) {
  const { t } = useTranslation();

  return (
    <div className={clsx('login-content', className)}>
      <h1 className="portkey-ui-flex-between-center font-medium login-title">
        <CustomSvg type="BackLeft" onClick={onBack} />
        <span>{t(type)}</span>
        <span className="empty"></span>
      </h1>
      <EmailLogin isLoading={isLoading} validateEmail={validateEmail} onFinish={onFinish} />
    </div>
  );
}
