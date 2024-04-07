'use client';
import { sleep } from '@portkey/utils';
import { useCallback, useRef } from 'react';
import { useEffectOnce } from 'react-use';
import '@portkey/did-ui-react/dist/assets/index.css';
import { ConfigProvider, TelegramLoginButton } from '@portkey/did-ui-react';

ConfigProvider.setGlobalConfig({
  // storageMethod: myStore,
  requestDefaults: {
    timeout: 30000,
    baseURL: 'https://test4-applesign-v2.portkey.finance',
  },
  serviceUrl: 'https://test4-applesign-v2.portkey.finance',

  // loginConfig: {
  //   loginMethodsOrder: ['Email', 'Google', 'Phone', 'Apple', 'Scan'],
  //   recommendIndexes: [0, 1],
  // },
});

export default function PortkeyWebapp() {
  const TelegramRef = useRef<any>();

  const getTelegram = useCallback(async () => {
    if (typeof window !== 'undefined') {
      await sleep(1000);

      TelegramRef.current = (window as any)?.Telegram;
      if (!TelegramRef.current) return;

      TelegramRef.current.WebApp.ready();
      console.log('🌈 🌈 🌈 🌈 🌈 🌈 TelegramRef.current', TelegramRef.current);
    }
  }, []);

  const onBeforeBack = useCallback(async () => {
    console.log('🌈 🌈 🌈 🌈 🌈 🌈 ', '');
  }, []);

  useEffectOnce(() => {
    getTelegram();
  });

  return (
    <div>
      <h1>Portkey webapp</h1>
      <TelegramLoginButton onBeforeBack={onBeforeBack} />
    </div>
  );
}
