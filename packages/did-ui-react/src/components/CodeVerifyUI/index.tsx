import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { PasscodeInput } from 'antd-mobile';
import { DIGIT_CODE } from '../../constants/misc';
import clsx from 'clsx';
import VerifierPair from '../VerifierPair';
import { useTranslation } from 'react-i18next';
import { useEffectOnce } from 'react-use';
import { BaseCodeVerifyProps } from '../types';
import './index.less';
import ThrottleButton from '../ThrottleButton';

const MAX_TIMER = 60;

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
      tipExtra,
      isLoginGuardian,
      guardianIdentifier,
      accountType = 'Email',
      code,
      onReSend,
      onCodeFinish,
      onCodeChange,
    }: BaseCodeVerifyUIProps,
    ref,
  ) => {
    const [timer, setTimer] = useState<number>(0);
    const timerRef = useRef<NodeJS.Timeout>();
    const { t } = useTranslation();

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
      if (error) return 'Invalid code';
      return timer ? `Resend after ${timer}s` : 'Resend';
    }, [error, timer]);

    return (
      <div className={clsx('verifier-account-wrapper', className)}>
        {isLoginGuardian && <div className="login-icon">{t('Login Account')}</div>}
        <div className="portkey-ui-flex-row-center login-account-wrapper">
          <VerifierPair guardianType={accountType} verifierSrc={verifier.imageUrl} verifierName={verifier.name} />
          <span className="login-account">{guardianIdentifier || ''}</span>
        </div>
        <div className="send-tip">
          {tipExtra}
          {`A ${DIGIT_CODE.length}-digit code was sent to `}
          <span className="account">{guardianIdentifier}</span>
          <br />
          {`Enter it within ${DIGIT_CODE.expiration} minutes`}
        </div>
        <div className={clsx('portkey-ui-code-verify-passcode', error && 'portkey-ui-code-verify-passcode-error')}>
          <PasscodeInput
            // error={error}
            value={code}
            length={DIGIT_CODE.length}
            seperated
            plain
            onChange={onCodeChange}
            onFill={onCodeFinish}
          />
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
