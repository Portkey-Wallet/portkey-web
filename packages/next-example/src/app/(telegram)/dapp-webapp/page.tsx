'use client';
import { useCallback, useEffect, useRef } from 'react';
import { useEffectOnce } from 'react-use';
import { privacyPolicy, termsOfService } from '@/constants/common';
import { DIDWalletInfo, SignIn, ISignIn, ConfigProvider, did } from '@portkey/did-ui-react';
import '@portkey/did-ui-react/dist/assets/index.css';
import './styles.css';
import { Button } from 'antd';
import { sleep } from '@portkey/utils';

ConfigProvider.setGlobalConfig({
  graphQLUrl: '/graphql',
  connectUrl: 'https://auth-aa-portkey-test.portkey.finance',
  serviceUrl: 'https://aa-portkey-test.portkey.finance',
  requestDefaults: {
    baseURL: 'https://aa-portkey-test.portkey.finance',
  },
  socialLogin: {
    Telegram: {
      botId: '7013879783',
    },
  },
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

  const setCurrentLifeCycle = useCallback(async () => {
    signInRef.current?.setCurrentLifeCycle(JSON.parse(localStorage.getItem('portkeyLifeCycle') || '{}'));
  }, []);

  const resetCurrentLifeCycle = useCallback(async () => {
    signInRef.current?.setCurrentLifeCycle(JSON.parse('{}'));
  }, []);
  useEffect(() => {
    typeof window !== 'undefined' && setCurrentLifeCycle();
  }, [setCurrentLifeCycle]);

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

      <Button onClick={setCurrentLifeCycle}>SetCurrentLifeCycle</Button>
      <Button onClick={resetCurrentLifeCycle}>ResetLoginLocalStorage</Button>
      <SignIn
        className="dapp-bot-sign"
        termsOfService={termsOfService}
        privacyPolicy={privacyPolicy}
        uiType="Full"
        ref={signInRef}
        onFinish={onFinish}
        onCancel={onCancel}
        // defaultLifeCycle={}
        onLifeCycleChange={(lifeCycle: any, nextLifeCycleProps: any) => {
          console.log(
            'onLifeCycleChange:',
            lifeCycle,
            nextLifeCycleProps,
            { [lifeCycle]: nextLifeCycleProps },
            JSON.stringify({ [lifeCycle]: nextLifeCycleProps }),
          );
          localStorage.setItem('portkeyLifeCycle', JSON.stringify({ [lifeCycle]: nextLifeCycleProps }));
        }}
      />
    </div>
  );
}
