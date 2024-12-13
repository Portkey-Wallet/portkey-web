import { useCallback, useRef, useState } from 'react';
import EmailInput, { EmailInputInstance } from '../EmailInput';
import { ValidatorHandler } from '../../types';
import { handleErrorMessage } from '../../utils';
import './index.less';
import clsx from 'clsx';
import ThrottleButton from '../ThrottleButton';

interface EmailInputAndButtonProps {
  className?: string;
  onFinish?: (email: string) => void;
  confirmText: string;
  isLoading?: boolean;
  validate?: ValidatorHandler;
}

export default function EmailInputAndButton({
  className,
  confirmText,
  isLoading = false,
  validate,
  onFinish,
}: EmailInputAndButtonProps) {
  const [val, setVal] = useState<string>();
  const [error, setError] = useState<string>();
  const emailInputInstance = useRef<EmailInputInstance>();
  const onClick = useCallback(async () => {
    try {
      console.log(val, 'val===');
      await emailInputInstance?.current?.validateEmail(val);

      val && onFinish?.(val);
    } catch (error: any) {
      const msg = handleErrorMessage(error);
      setError(msg);
    }
  }, [onFinish, val]);

  return (
    <div className={clsx('email-sign-wrapper', className)}>
      <EmailInput
        val={val}
        ref={emailInputInstance}
        error={error}
        validate={validate}
        onChange={(v) => {
          setError(undefined);
          setVal(v);
        }}
      />
      <ThrottleButton
        className="login-primary-btn"
        type="primary"
        disabled={!val || !!error}
        onClick={onClick}
        loading={isLoading}>
        {confirmText}
      </ThrottleButton>
    </div>
  );
}
