import useReCaptcha from '../../hooks/useReCaptcha';
import GoogleReCaptcha from '../GoogleReCaptcha';
import { useEffect, useCallback, useState } from 'react';
import { eventBus } from '../../utils';
import { SET_RECAPTCHA_MODAL } from '../../constants/events';
import { BaseReCaptchaHandler } from '../types';
import CommonModal from '../CommonModal';
import { setReCaptchaModal } from '../../utils/reCaptcha';
import './index.less';

export default function ReCaptchaModal() {
  const reCaptchaInfo = useReCaptcha();
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

  useEffect(() => {
    eventBus.addListener(SET_RECAPTCHA_MODAL, setHandler);
    return () => {
      eventBus.removeListener(SET_RECAPTCHA_MODAL, setHandler);
    };
  }, [setHandler]);

  const onCancel = useCallback(() => {
    modalInfo?.onCancel?.();
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
            theme={reCaptchaInfo?.theme || 'light'}
            size={reCaptchaInfo?.size || 'normal'}
            siteKey={reCaptchaInfo?.siteKey || ''}
            onSuccess={(res) => {
              modalInfo?.onSuccess?.(res);
              setReCaptchaModal(false);
            }}
            onExpire={(e) => {
              modalInfo?.onExpire?.(e);
              setReCaptchaModal(false);
            }}
            onError={(e) => {
              modalInfo?.onError?.(e);
              setReCaptchaModal(false);
            }}
          />
        ) : (
          'loading'
        )}
      </div>
    </CommonModal>
  );
}
