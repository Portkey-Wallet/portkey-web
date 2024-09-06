import { did } from '@portkey/did';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ICodeVerifyUIInterface, MAX_TIMER } from '../../CodeVerifyUI';
import { Form } from 'antd';
import { sleep } from '@portkey/utils';
import { setLoading, verification } from '../../../utils';
import { checkEmail, handleErrorMessage } from '../../../utils';
import { singleMessage } from '../../CustomAnt';
import useReCaptchaModal from '../../../hooks/useReCaptchaModal';

export function useIsSecondaryMailSet() {
  const [secondaryEmail, setSecondaryEmail] = useState<string>('');
  // useEffect(() => {
  //   (async () => {
  //     await getSecondaryMail();
  //   })();
  // });
  const getSecondaryMail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await did.services.common.getSecondaryMail();
      setSecondaryEmail(res.secondaryEmail);
      return true;
    } catch (e) {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  return {
    secondaryEmail,
    showNotSet: !secondaryEmail,
    getSecondaryMail,
  };
}

export function useSecondaryMail(defaultMail: string, onBack?: () => void, onSetSecondaryMailboxSuccess?: () => void) {
  const [form] = Form.useForm();
  const inputRef = useRef<any>();
  const [editable, setEditable] = useState(false);
  const [codeVerifyVisible, setCodeVerifyVisible] = useState(false);
  const uiRef = useRef<ICodeVerifyUIInterface>();
  const [codeError, setCodeError] = useState<boolean>();
  const [code, setCode] = useState<string>();
  const [value, setValue] = useState<string>(defaultMail);
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
    async (verificationCode: string, verifierSessionId: string) => {
      const res = await verification.checkSecondaryVerificationCode({
        verificationCode,
        verifierSessionId,
        secondaryEmail: value,
      });
      if (res.verifiedResult) {
        return true;
      }
    },
    [value],
  );
  const onWrapperBackClick = useCallback(() => {
    if (editable) {
      setError('');
      setEditable(false);
      setValue(defaultMail);
      form.setFieldsValue({ mailbox: defaultMail });
    } else {
      onBack?.();
    }
  }, [defaultMail, editable, form, onBack]);
  const setInputError = useCallback(async (isError?: boolean) => {
    if (!isError) return setCodeError(isError);
    setCodeError(true);
    await sleep(2000);
    setCodeError(false);
  }, []);
  const onBottomButtonClick = useCallback(async () => {
    if (!editable) {
      setEditable(true);
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    } else {
      try {
        setLoading(true);
        const checkError = checkEmail(value);
        console.log('checkError', checkError, value);
        if (checkError) {
          setError(handleErrorMessage(checkError));
          return;
        }
        setError('');
        console.log('click save!!!', value);
        const { verifierSessionId } = await sendVerifyCode(value);
        verifierSessionIdRef.current = verifierSessionId;
        setCodeVerifyVisible(true);
      } catch (e: any) {
        singleMessage.error(e.message);
      } finally {
        setLoading(false);
      }
    }
  }, [editable, sendVerifyCode, value]);

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
    async (code: string) => {
      try {
        if (code && code.length === 6) {
          if (!verifierSessionIdRef.current)
            throw Error(`VerifierSessionId(${verifierSessionIdRef.current}) is invalid`);
          setLoading(true);

          const res = await checkVerifyCode(code, verifierSessionIdRef.current);
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
  const onReSend = useCallback(async () => {
    try {
      setLoading(true);
      const result = await sendVerifyCode(value);
      if (!result.verifierSessionId)
        return console.warn('The request was rejected, please check whether the parameters are correct');
      uiRef.current?.setTimer(MAX_TIMER);
      verifierSessionIdRef.current = result.verifierSessionId;
    } catch (e: any) {
      singleMessage.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [sendVerifyCode, value]);
  return {
    sendVerifyCode,
    checkVerifyCode,
    form,
    uiRef,
    inputRef,
    editable,
    codeVerifyVisible,
    onCodeChange,
    onReSend,
    onCodeFinish,
    handleBackView,
    onBottomButtonClick,
    onWrapperBackClick,
    codeError,
    code,
    setCodeVerifyVisible,
    setCode,
    value,
    setValue,
    error,
  };
}
