import { useCallback } from 'react';
import { handleErrorMessage } from '../utils';
import { setReCaptchaModal } from '../utils/reCaptcha';
import useReCaptcha from './useReCaptcha';
export default function useReCaptchaModal() {
  const reCaptchaInfo = useReCaptcha();

  return useCallback(
    async (open?: boolean) => {
      try {
        if (open && reCaptchaInfo?.customReCaptchaHandler) {
          const info = await reCaptchaInfo.customReCaptchaHandler();
          if (info.type === 'success') return info;
          throw info;
        } else {
          const info = await setReCaptchaModal(open);
          if (info.type === 'success') return info;
          throw info;
        }
      } catch (e: any) {
        if (e.type === 'cancel') throw handleErrorMessage(e, 'User Cancel');
        if (e.type === 'error') throw handleErrorMessage(e, 'ReCaptcha error');
        if (e.type === 'expire') throw handleErrorMessage(e, 'ReCaptcha expire');
        throw e;
      }
    },
    [reCaptchaInfo],
  );
}
