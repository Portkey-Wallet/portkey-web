import { Button } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PasscodeInput } from 'antd-mobile';
import { DIGIT_CODE } from '../../constants/misc';
import clsx from 'clsx';
import VerifierPair from '../VerifierPair';
import { useTranslation } from 'react-i18next';
import { errorTip, verifyErrorHandler, setLoading, did, verification, handleErrorMessage } from '../../utils';
import { useEffectOnce } from 'react-use';
import { OnErrorFunc } from '../../types';
import type { ChainId } from '@portkey/types';
import type { AccountType } from '@portkey/services';
import type { VerifierItem } from '@portkey/did';
import './index.less';

const MAX_TIMER = 60;

export interface CodeVerifyProps {
  chainId: ChainId;
  verifier: VerifierItem;
  className?: string;
  accountType?: AccountType;
  isCountdownNow?: boolean;
  isLoginAccount?: boolean;
  guardianIdentifier: string;
  verifierSessionId: string;
  isErrorTip?: boolean;
  onError?: OnErrorFunc;
  onSuccess?: (res: { verificationDoc: string; signature: string; verifierId: string }) => void;
  onReSend?: (result: { verifier: VerifierItem; verifierSessionId: string }) => void;
}

export default function CodeVerify({
  chainId,
  verifier,
  className,
  isErrorTip,
  isCountdownNow,
  isLoginAccount,
  guardianIdentifier,
  accountType = 'Email',
  verifierSessionId,
  onError,
  onReSend,
  onSuccess,
}: CodeVerifyProps) {
  const [timer, setTimer] = useState<number>(0);
  const [pinVal, setPinVal] = useState<string>();
  const timerRef = useRef<NodeJS.Timer>();
  const [_verifierSessionId, setVerifierSessionId] = useState<string>(verifierSessionId);
  const { t } = useTranslation();

  useEffectOnce(() => {
    isCountdownNow && setTimer(MAX_TIMER);
  });

  const onFinish = useCallback(
    async (code: string) => {
      try {
        if (code && code.length === 6) {
          if (!_verifierSessionId) throw Error('Missing verifierSessionId!!!');
          setLoading(true);
          const result = await did.services.verifyVerificationCode({
            verifierSessionId: _verifierSessionId,
            verificationCode: code,
            guardianIdentifier: guardianIdentifier.replaceAll(/\s+/g, ''),
            verifierId: verifier.id,
            chainId,
          });
          setLoading(false);

          if (result.signature) return onSuccess?.({ ...result, verifierId: verifier?.id || '' });
          setPinVal('');
        }
      } catch (error: any) {
        setLoading(false);
        setPinVal('');
        const _error = verifyErrorHandler(error);
        errorTip(
          {
            errorFields: 'CodeVerify',
            error: _error,
          },
          isErrorTip,
          onError,
        );
      }
    },

    [_verifierSessionId, guardianIdentifier, verifier.id, chainId, onSuccess, isErrorTip, onError],
  );

  const resendCode = useCallback(async () => {
    try {
      if (!guardianIdentifier) throw Error('Missing loginGuardianType');
      setLoading(true);
      console.log(guardianIdentifier.replaceAll(/\s+/g, ''), 'resendCode');
      const result = await verification.sendVerificationCode({
        type: accountType,
        guardianIdentifier: guardianIdentifier.replaceAll(/\s+/g, ''),
        verifierId: verifier.id,
        chainId,
      });
      setLoading(false);
      if (result.verifierSessionId) {
        setTimer(MAX_TIMER);
        onReSend?.({ verifier, ...result });
        setVerifierSessionId(result.verifierSessionId);
      }
    } catch (error: any) {
      setLoading(false);
      const msg = handleErrorMessage(error);
      errorTip(
        {
          errorFields: 'CodeVerify',
          error: msg,
        },
        isErrorTip,
        onError,
      );
    }
  }, [accountType, chainId, guardianIdentifier, isErrorTip, onError, onReSend, verifier]);

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

  return (
    <div className={clsx('verifier-account-wrapper', className)}>
      {isLoginAccount && <div className="login-icon">{t('Login Account')}</div>}
      <div className="flex-row-center login-account-wrapper">
        <VerifierPair guardianType={accountType} verifierSrc={verifier.imageUrl} verifierName={verifier.name} />
        <span className="login-account">{guardianIdentifier || ''}</span>
      </div>
      <div className="send-tip">
        {`A ${DIGIT_CODE.length}-digit code was sent to `}
        <span className="account">{guardianIdentifier}</span>
        <br />
        {`Enter it within ${DIGIT_CODE.expiration} minutes`}
      </div>
      <div className="password-wrapper">
        <PasscodeInput
          value={pinVal}
          length={DIGIT_CODE.length}
          seperated
          plain
          onChange={(v) => setPinVal(v)}
          onFill={onFinish}
        />
        <Button
          type="text"
          disabled={!!timer}
          onClick={resendCode}
          className={clsx('text-center resend-btn', timer && 'resend-after-btn')}>
          {timer ? `Resend after ${timer}s` : t('Resend')}
        </Button>
      </div>
    </div>
  );
}
