import { Input } from 'antd';
import { forwardRef, useCallback, useImperativeHandle } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { ValidatorHandler } from '../../types';
import { checkEmail } from '../../utils';
import './index.less';

interface EmailInputProps {
  wrapperClassName?: string;
  error?: string;
  val?: string;
  onChange?: (val: string) => void;
  validate?: (email?: string) => Promise<any>;
}

export interface EmailInputInstance {
  validateEmail: ValidatorHandler;
}

const EmailInput = forwardRef(({ error, val, wrapperClassName, validate, onChange }: EmailInputProps, ref) => {
  const { t } = useTranslation();

  const validateEmail = useCallback(
    async (email?: string) => {
      const checkError = checkEmail(email);
      if (checkError) throw checkError;
      await validate?.(email);
    },
    [validate],
  );

  useImperativeHandle(ref, () => ({ validateEmail }));

  return (
    <div className={clsx('email-input-wrapper', wrapperClassName)}>
      <div className="input-wrapper">
        <Input
          className="login-input"
          value={val}
          placeholder={t('Enter your email')}
          allowClear
          onChange={(e) => {
            onChange?.(e.target.value);
          }}
        />
        {error && <span className="error-text">{error}</span>}
      </div>
    </div>
  );
});

export default EmailInput;
