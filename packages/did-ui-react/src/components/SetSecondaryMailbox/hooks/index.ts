import { useCallback, useEffect, useRef, useState } from 'react';
import { ICodeVerifyUIInterface, MAX_TIMER } from '../../CodeVerifyUI';
import { sleep } from '@portkey/utils';
import { setLoading, verification } from '../../../utils';
import { checkEmail, handleErrorMessage } from '../../../utils';
import { singleMessage } from '../../CustomAnt';
import useReCaptchaModal from '../../../hooks/useReCaptchaModal';

export function useSecondaryMail(onSetSecondaryMailboxSuccess?: () => void) {
  const [codeVerifyVisible, setCodeVerifyVisible] = useState(false);
  const uiRef = useRef<ICodeVerifyUIInterface>();
  const [codeError, setCodeError] = useState<boolean>();
  const [code, setCode] = useState<string>();
  const [error, setError] = useState<string>('');
  const verifierSessionIdRef = useRef<string>();
  const reCaptchaHandler = useReCaptchaModal();
  const sendVerifyCode = useCallback(
    async (secondaryEmail: string) => {
      const res = await verification.sendSecondaryVerificationCode(
        {
          params: {
            secondaryEmail,
          },
        },
        reCaptchaHandler,
      );
      return res;
    },
    [reCaptchaHandler],
  );
  const checkVerifyCode = useCallback(
    async (verificationCode: string, verifierSessionId: string, secondaryEmail: string) => {
      const res = await verification.checkSecondaryVerificationCode({
        verificationCode,
        verifierSessionId,
        secondaryEmail,
      });
      if (res.verifiedResult) {
        return true;
      }
    },
    [],
  );
  const setInputError = useCallback(async (isError?: boolean) => {
    if (!isError) return setCodeError(isError);
    setCodeError(true);
    await sleep(2000);
    setCodeError(false);
  }, []);
  const triggerVerifyCode = useCallback(
    async (email: string) => {
      try {
        setLoading(true);
        const checkError = checkEmail(email);
        console.log('checkError', checkError, email);
        if (checkError) {
          setError(handleErrorMessage(checkError));
          return;
        }
        setError('');
        console.log('click save!!!', email);
        const { verifierSessionId } = await sendVerifyCode(email);
        verifierSessionIdRef.current = verifierSessionId;
        setCodeVerifyVisible(true);
      } catch (e: any) {
        singleMessage.error(e.message);
      } finally {
        setLoading(false);
      }
    },
    [sendVerifyCode],
  );

  const handleBackView = useCallback(() => {
    setCode('');
    console.log('handleBackView');
  }, []);
  useEffect(() => {
    return () => {
      setCode('');
    };
  }, []);
  const onCodeChange = useCallback((code: string) => {
    setCode(code);
    setCodeError(false);
  }, []);
  const onCodeFinish = useCallback(
    async (code: string, email: string) => {
      try {
        if (code && code.length === 6) {
          if (!verifierSessionIdRef.current)
            throw Error(`VerifierSessionId(${verifierSessionIdRef.current}) is invalid`);
          setLoading(true);

          const res = await checkVerifyCode(code, verifierSessionIdRef.current, email);
          setCode('');
          if (res) {
            singleMessage.success('Save Success!');
            onSetSecondaryMailboxSuccess?.();
          } else {
            throw Error('Please check if the code is entered correctly');
          }
        } else {
          throw Error('Please check if the code is entered correctly');
        }
      } catch (error: any) {
        setCode('');
        setInputError(true);
        singleMessage.error(error.message);
      } finally {
        setLoading(false);
      }
    },
    [checkVerifyCode, onSetSecondaryMailboxSuccess, setInputError],
  );
  const onReSend = useCallback(
    async (email: string) => {
      try {
        setLoading(true);
        const result = await sendVerifyCode(email);
        if (!result.verifierSessionId)
          return console.warn('The request was rejected, please check whether the parameters are correct');
        uiRef.current?.setTimer(MAX_TIMER);
        verifierSessionIdRef.current = result.verifierSessionId;
      } catch (e: any) {
        singleMessage.error(e.message);
      } finally {
        setLoading(false);
      }
    },
    [sendVerifyCode],
  );
  return {
    sendVerifyCode,
    checkVerifyCode,
    uiRef,
    codeVerifyVisible,
    onCodeChange,
    onReSend,
    onCodeFinish,
    handleBackView,
    triggerVerifyCode,
    codeError,
    code,
    setCodeVerifyVisible,
    setCode,
    error,
  };
}
