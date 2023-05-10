import { Button } from 'antd';
import { useCallback, useRef, useState } from 'react';
import EmailInput, { EmailInputInstance } from '../EmailInput';
import { ValidatorHandler } from '../../types';
import { handleErrorMessage, setLoading } from '../../utils';
import './index.less';

interface EmailTabProps {
  onFinish?: (email: string) => void;
  confirmText: string;
  validate?: ValidatorHandler;
}

export default function EmailTab({ confirmText, validate, onFinish }: EmailTabProps) {
  const [val, setVal] = useState<string>();
  const [error, setError] = useState<string>();
  const emailInputInstance = useRef<EmailInputInstance>();
  const onClick = useCallback(async () => {
    try {
      setLoading(true);
      await emailInputInstance?.current?.validateEmail(val);
      setLoading(false);
      val && onFinish?.(val);
    } catch (error: any) {
      setLoading(false);
      const msg = handleErrorMessage(error);
      setError(msg);
    }
  }, [onFinish, val]);

  return (
    <div className="email-sign-wrapper">
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
      <Button className="login-primary-btn" type="primary" disabled={!val || !!error} onClick={onClick}>
        {confirmText}
      </Button>
    </div>
  );
}
