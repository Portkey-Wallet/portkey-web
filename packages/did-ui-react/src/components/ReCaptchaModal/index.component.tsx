import useReCaptcha from '../../hooks/useReCaptcha';
import { useEffect, useCallback, useState, useRef } from 'react';
import { eventBus, setLoading } from '../../utils';
import { SET_RECAPTCHA_MODAL } from '../../constants/events';
import { BaseReCaptchaHandler } from '../types';
import CommonModal from '../CommonModal';
import { setReCaptchaModal } from '../../utils/reCaptcha';
import { defaultReCaptchaSiteKey } from '../../constants/reCaptcha';
import { usePortkey } from '../context';
import { useUpdateEffect } from 'react-use';
import { WEB_PAGE } from '../../constants';
import './index.less';

const ReCaptchaIframe = `${WEB_PAGE}/recaptcha`;

export default function ReCaptchaModal() {
  const reCaptchaInfo = useReCaptcha();
  const [{ theme }] = usePortkey();

  const [modalInfo, setModalInfo] = useState<
    {
      open?: boolean;
    } & BaseReCaptchaHandler
  >();

  const setHandler = useCallback((open?: boolean, handlers?: BaseReCaptchaHandler) => {
    if (open) setModalLoading(true);
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

  const closeModal = useCallback(() => {
    setReCaptchaModal(false);
  }, []);

  const onCancel = useCallback(() => {
    if (!errorRef.current) modalInfo?.onCancel?.();
    closeModal();
  }, [closeModal, modalInfo]);

  const ref = useRef<HTMLIFrameElement>();

  const [isLoading, setModalLoading] = useState(false);

  const eventHandler = useCallback(
    (event: MessageEvent<any>) => {
      if (event.data.target === '@portkey/ui-did-react:ReCaptcha') {
        switch (event.data.type) {
          case 'PortkeyReCaptchaOnSuccess':
            modalInfo?.onSuccess?.(event.data.data);
            closeModal();
            break;
        }
      }
    },
    [closeModal, modalInfo],
  );

  const connect = useCallback(() => {
    window.addEventListener('message', eventHandler);
  }, [eventHandler]);

  useUpdateEffect(() => {
    if (modalInfo?.open) {
      connect();
      setLoading(true);
    } else {
      setModalLoading(true);
      window.removeEventListener('message', eventHandler);
    }
  }, [modalInfo?.open]);

  const timeRef = useRef<NodeJS.Timeout | null>();

  const iframeLoad = useCallback(() => {
    setModalLoading(false);
    if (timeRef.current) clearTimeout(timeRef.current);
    timeRef.current = setTimeout(() => {
      timeRef.current && clearTimeout(timeRef.current);
      timeRef.current = null;
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <CommonModal
      closable={false}
      className={'reCaptcha-modal-container'}
      open={modalInfo?.open}
      maskClosable
      width={600}
      onCancel={onCancel}>
      <div className="reCaptcha-modal-inner">
        <iframe
          onLoad={iframeLoad}
          ref={ref as any}
          style={{ width: isLoading ? 0 : '100%', border: '0' }}
          src={`${ReCaptchaIframe}?siteKey=${reCaptchaInfo?.siteKey || defaultReCaptchaSiteKey}&theme=${
            reCaptchaInfo?.theme || theme || 'light'
          }&size=${reCaptchaInfo?.size || 'normal'}`}></iframe>
      </div>
    </CommonModal>
  );
}
