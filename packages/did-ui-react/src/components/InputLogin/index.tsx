import { ValidatorHandler } from '../../types';
import EmailLogin, { EmailLoginProps } from '../EmailLogin';
import type { CreateWalletType, IPhoneCountry } from '../types';
import './index.less';
import { AccountType } from '@portkey/services';
import clsx from 'clsx';

export default function InputLogin({
  className,
  isLoading,
  onBack,
  onClose,
  onFinish,
  validateEmail,
  switchType,
}: {
  className?: string;
  isLoading?: boolean;
  phoneCountry?: IPhoneCountry; // deprecated
  defaultAccountType?: AccountType; // deprecated
  onBack?: () => void;
  onClose?: () => void;
  onFinish?: EmailLoginProps['onFinish'];
  validateEmail?: ValidatorHandler;
  validatePhone?: ValidatorHandler; // deprecated
  switchType?: (type: CreateWalletType) => void;
}) {
  return (
    <div className={clsx('login-content', className)}>
      <EmailLogin
        isLoading={isLoading}
        validateEmail={validateEmail}
        onFinish={onFinish}
        onBack={onBack}
        onClose={onClose}
        switchType={switchType}
      />
    </div>
  );
}
