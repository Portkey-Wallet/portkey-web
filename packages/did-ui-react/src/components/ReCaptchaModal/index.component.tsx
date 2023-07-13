import useReCaptcha from '../../hooks/useReCaptcha';
import GoogleReCaptcha from '../GoogleReCaptcha';
import { useEffect, useCallback, useState, useRef } from 'react';
import { eventBus } from '../../utils';
import { SET_RECAPTCHA_MODAL } from '../../constants/events';
import { BaseReCaptchaHandler } from '../types';
import CommonModal from '../CommonModal';
import { setReCaptchaModal } from '../../utils/reCaptcha';
import { defaultReCaptchaSiteKey } from '../../constants/reCaptcha';
import './index.less';
import { usePortkey } from '../context';

export default function ReCaptchaModal() {
  const reCaptchaInfo = useReCaptcha();
  const [{ theme }] = usePortkey();

  const [modalInfo, setModalInfo] = useState<
    {
      open?: boolean;
    } & BaseReCaptchaHandler
  >();
  const setHandler = useCallback((open?: boolean, handlers?: BaseReCaptchaHandler) => {
    setModalInfo({
      open,
      ...handlers,
    });
  }, []);

  const errorRef = useRef<any>();

  useEffect(() => {
    eventBus.addListener(SET_RECAPTCHA_MODAL, setHandler);
    return () => {
      eventBus.removeListener(SET_RECAPTCHA_MODAL, setHandler);
    };
  }, [setHandler]);

  const onCancel = useCallback(() => {
    if (!errorRef.current) modalInfo?.onCancel?.();
    setReCaptchaModal(false);
  }, [modalInfo]);

  return (
    <CommonModal
      closable={false}
      className={'reCaptcha-modal-container'}
      open={modalInfo?.open}
      maskClosable
      width={360}
      onCancel={onCancel}
      title={'Are you a robot?'}>
      <div className="reCaptcha-modal-inner">
        {typeof window !== 'undefined' ? (
          <GoogleReCaptcha
            theme={reCaptchaInfo?.theme || theme || 'light'}
            size={reCaptchaInfo?.size || 'normal'}
            siteKey={reCaptchaInfo?.siteKey || defaultReCaptchaSiteKey}
            onSuccess={(res) => {
              modalInfo?.onSuccess?.(res);
              setReCaptchaModal(false);
            }}
            onExpire={(e) => {
              modalInfo?.onExpire?.(e);
              // setReCaptchaModal(false);
              errorRef.current = 'reCaptcha expired';
            }}
            onError={(e) => {
              modalInfo?.onError?.(e);
              // setReCaptchaModal(false);
              errorRef.current = 'reCaptcha error';
            }}
          />
        ) : (
          'loading'
        )}
      </div>
    </CommonModal>
  );
}
