import { useCallback } from 'react';
import { did } from '../utils';
import { handleErrorMessage } from '../utils';
import { setReCaptchaModal } from '../utils/reCaptcha';
import useReCaptcha from './useReCaptcha';
import { ReCaptchaResponseType } from '../components';
import { OperationTypeEnum } from '@portkey/services';

export default function useReCaptchaModal() {
  const reCaptchaInfo = useReCaptcha();

  return useCallback(
    async (
      open?: boolean,
      operationType: OperationTypeEnum = OperationTypeEnum.register,
    ): Promise<{ type: ReCaptchaResponseType; message?: any }> => {
      if (open) {
        let needGoogleRecaptcha = true;
        // When the operationType is register, the google recaptcha is required.
        if (operationType !== OperationTypeEnum.register) {
          needGoogleRecaptcha = await did.services.checkGoogleRecaptcha({
            operationType,
          });
        }
        if (!needGoogleRecaptcha) return { type: 'success', message: 'not use' };
      }

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
