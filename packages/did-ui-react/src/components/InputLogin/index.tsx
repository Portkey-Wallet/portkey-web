import { ValidatorHandler } from '../../types';
import EmailLogin, { EmailLoginProps } from '../EmailLogin';
import type { IPhoneCountry } from '../types';
import './index.less';
import { AccountType } from '@portkey/services';
import clsx from 'clsx';

export default function InputLogin({
  className,
  isLoading,
  // onBack,
  onFinish,
  validateEmail,
}: {
  className?: string;
  isLoading?: boolean;
  phoneCountry?: IPhoneCountry; // deprecated
  defaultAccountType?: AccountType; // deprecated
  onBack?: () => void;
  onFinish?: EmailLoginProps['onFinish'];
  validateEmail?: ValidatorHandler;
  validatePhone?: ValidatorHandler; // deprecated
}) {
  return (
    <div className={clsx('login-content', className)}>
      <EmailLogin isLoading={isLoading} validateEmail={validateEmail} onFinish={onFinish} />
    </div>
  );
}
