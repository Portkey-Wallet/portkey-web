'use client';
import { useCallback, useRef } from 'react';
import { useEffectOnce } from 'react-use';
import { privacyPolicy, termsOfService } from '@/constants/common';
import { DIDWalletInfo, SignIn, ISignIn, ConfigProvider, did } from '@portkey/did-ui-react';
import '@portkey/did-ui-react/dist/assets/index.css';
import './styles.css';
import { Button } from 'antd';
import { sleep } from '@portkey/utils';

ConfigProvider.setGlobalConfig({
  graphQLUrl: '/graphql',
  connectUrl: 'http://192.168.66.117:8080',
  serviceUrl: 'https://test4-applesign-v2.portkey.finance',
  requestDefaults: {
    baseURL: 'https://test4-applesign-v2.portkey.finance',
  },
  dappTelegramLink: 'https://t.me/Dapp_V5_Bot/dappv5',
});

export default function DappWebapp() {
  const signInRef = useRef<ISignIn>(null);
  const TelegramRef = useRef<any>();

  const getTelegram = useCallback(async () => {
    if (typeof window !== 'undefined') {
      await sleep(1000);

      TelegramRef.current = (window as any)?.Telegram;
      if (!TelegramRef.current) return;

      TelegramRef.current.WebApp.ready();
    }
  }, []);

  useEffectOnce(() => {
    getTelegram();
  });

  const onCancel = useCallback(() => signInRef.current?.setOpen(false), [signInRef]);

  const onFinish = useCallback(async (didWallet: DIDWalletInfo) => {
    console.log('didWallet', didWallet);
    did.save(didWallet.pin);
  }, []);

  return (
    <div>
      <a href="assets">
        <Button>Go to assets</Button>
      </a>
      <SignIn
        className="dapp-bot-sign"
        termsOfService={termsOfService}
        privacyPolicy={privacyPolicy}
        uiType="Full"
        ref={signInRef}
        onFinish={onFinish}
        onCancel={onCancel}
      />
    </div>
  );
}
