import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { PasscodeInput } from 'antd-mobile';
import { DIGIT_CODE } from '../../constants/misc';
import clsx from 'clsx';
import { useEffectOnce } from 'react-use';
import { BaseCodeVerifyProps } from '../types';
import './index.less';
import ThrottleButton from '../ThrottleButton';

export const MAX_TIMER = 60;

export interface ICodeVerifyUIInterface {
  setTimer: (timer: number) => void;
}

export interface BaseCodeVerifyUIProps extends BaseCodeVerifyProps {
  code?: string;
  error?: boolean;
  onCodeChange?: (code: string) => void;
  onReSend?: () => void;
  onCodeFinish?: (code: string) => void;
}

const CodeVerifyUI = forwardRef(
  (
    {
      verifier,
      className,
      error = false,
      isCountdownNow,
      guardianIdentifier,
      code,
      onReSend,
      onCodeFinish,
      onCodeChange,
    }: BaseCodeVerifyUIProps,
    ref,
  ) => {
    const [timer, setTimer] = useState<number>(0);
    const timerRef = useRef<NodeJS.Timer>();

    useImperativeHandle(ref, () => ({ setTimer }));

    useEffectOnce(() => {
      isCountdownNow && setTimer(MAX_TIMER);
    });
    useEffect(() => {
      if (timer !== MAX_TIMER) return;
      timerRef.current && clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          const newTime = t - 1;
          if (newTime <= 0) {
            timerRef.current && clearInterval(timerRef.current);
            timerRef.current = undefined;
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }, [timer]);

    const btnText = useMemo(() => {
      return timer ? `Resend in ${timer}s` : 'Resend verification code';
    }, [timer]);

    return (
      <div className={clsx('verifier-account-wrapper', className)}>
        <div className="verifier-account-title">Verify your email</div>
        {verifier && (
          <div className="verifier-account-desc">
            <span>{`${verifier.name}, your assigned Guardian Verifier, has sent a verification email to`}&nbsp;</span>
            <span className="verifier-account-desc-account">{guardianIdentifier}</span>
            <span>{`. Please enter the 6-digit code from the email to continue.`}</span>
          </div>
        )}

        <div className={clsx('portkey-ui-code-verify-passcode', error && 'portkey-ui-code-verify-passcode-error')}>
          <PasscodeInput
            error={error}
            value={code}
            length={DIGIT_CODE.length}
            seperated
            plain
            onChange={onCodeChange}
            onFill={onCodeFinish}
          />
          {error && (
            <div className="portkey-ui-code-verify-passcode-error-message">{`Incorrect code, please try again.`}</div>
          )}
          <ThrottleButton
            type="text"
            disabled={!!timer}
            onClick={onReSend}
            className={clsx('portkey-ui-text-center resend-btn', timer && 'resend-after-btn')}>
            {btnText}
          </ThrottleButton>
        </div>
      </div>
    );
  },
);

export default CodeVerifyUI;
