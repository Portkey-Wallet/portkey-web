import { Button } from 'antd';
import { useCallback, useRef, useState } from 'react';
import { useEffectOnce } from 'react-use';
import qs from 'query-string';
import { sleep } from '@portkey/utils';
import { TelegramWebappInitData } from '@portkey/types';
import './index.less';
import { handleErrorMessage, setLoading } from '../../utils';
import { singleMessage } from '../CustomAnt';
import { getAccessTokenAndOpenDappWebapp, getTelegramStartParam } from '../../utils/telegram';
import clsx from 'clsx';

export interface TelegramWebappInitUserData {
  id: string;
  first_name: string;
  last_name: string;
  language_code: string;
  allows_write_to_pm: boolean;
}

export interface TelegramLoginButtonProps {
  className?: string;
  onBeforeBack?: () => Promise<void> | void;
}

export default function TelegramLoginButton({ className, onBeforeBack }: TelegramLoginButtonProps) {
  const TelegramRef = useRef<any>();
  const telegramInitData = useRef<TelegramWebappInitData>();
  const [userName, setUserName] = useState('');

  const getTelegram = useCallback(async () => {
    if (typeof window !== 'undefined') {
      await sleep(1000);

      TelegramRef.current = (window as any)?.Telegram;

      if (!TelegramRef.current) return;
      if (!TelegramRef.current.WebApp.platform || TelegramRef.current.WebApp.platform === 'unknown') {
        throw new Error('Please use it within telegram platform');
      }

      TelegramRef.current.WebApp.ready();
      const initDataString = TelegramRef.current.WebApp.initData;
      const initData = qs.parse(initDataString) as unknown as TelegramWebappInitData;
      telegramInitData.current = initData;

      // show user name
      if (initData?.user && typeof initData.user === 'string') {
        const userObject = JSON.parse(initData.user) as TelegramWebappInitUserData;
        setUserName(userObject.first_name);
      }
    }
  }, []);

  useEffectOnce(() => {
    getTelegram();
  });

  const handleTGAuth = useCallback(async () => {
    if (!telegramInitData.current?.user || !telegramInitData.current?.auth_date || !telegramInitData.current?.hash) {
      return singleMessage.info('Please wait');
    }

    try {
      setLoading(true);

      const { startParam } = getTelegramStartParam();
      if (!startParam) throw Error('No loginId');

      await getAccessTokenAndOpenDappWebapp({
        loginId: startParam,
        telegramUserInfo: telegramInitData.current,
        onBeforeBack,
      });

      setLoading(false);
    } catch (error) {
      throw Error(handleErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [onBeforeBack]);

  return (
    <>
      <Button onClick={handleTGAuth} className={clsx('portkey-ui-telegram-login-button', className)}>
        {`Log in as ${userName}`}
      </Button>
    </>
  );
}
