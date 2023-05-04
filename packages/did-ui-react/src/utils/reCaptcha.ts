import { eventBus } from './index';
import { SET_RECAPTCHA_MODAL } from '../constants/events';
import { ReCaptchaType } from '../components';

export const setReCaptchaModal: (open?: boolean) => Promise<{ type: ReCaptchaType; message?: any }> = (
  open?: boolean,
) =>
  new Promise((resolve, reject) => {
    eventBus.emit(SET_RECAPTCHA_MODAL, open, {
      onSuccess: (result: string) => resolve({ type: 'success', message: result }),
      onExpire: (e: any) => reject({ type: 'expire', message: e }),
      onError: (e: any) => reject({ type: 'error', message: e }),
      onCancel: () => reject({ type: 'cancel' }),
    });
  });
