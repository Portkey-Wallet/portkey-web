import { did } from '@portkey/did';
import { handleErrorMessage, setLoading } from '../utils';
import { getTelegramStartParam, getAccessTokenInDappTelegram } from '../utils/telegram';
import { useCallback, useEffect, useRef } from 'react';

export function useGetTelegramAccessToken({
  canGetAuthToken = true,
  callback,
}: {
  canGetAuthToken?: boolean;
  callback: (decodeResult: any) => Promise<void>;
}) {
  const timerRef = useRef<NodeJS.Timer | number>();

  const getAccessToken = useCallback(async () => {
    const { startParam } = getTelegramStartParam();
    if (startParam) {
      setLoading(true);
      clearInterval(timerRef.current);
      try {
        const decodeResult = await getAccessTokenInDappTelegram(startParam);
        console.log('===res.data', decodeResult);
        if (!decodeResult) return;

        await did.config.storageMethod.removeItem(startParam);
        await callback(decodeResult);
      } catch (error) {
        throw new Error(handleErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }
  }, [callback]);

  useEffect(() => {
    if (canGetAuthToken) {
      console.log('=== useEffect setInterval', '');
      // TODO tg
      timerRef.current = setInterval(() => {
        getAccessToken();
      }, 2000);
    }

    return () => {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    };
  }, [canGetAuthToken, getAccessToken]);
}
