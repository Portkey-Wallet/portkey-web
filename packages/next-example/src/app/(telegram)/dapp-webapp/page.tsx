'use client';
import { useCallback, useRef } from 'react';
import { useEffectOnce } from 'react-use';
import { privacyPolicy, termsOfService } from '@/constants/common';
import { DIDWalletInfo, SignIn, ISignIn, PortkeyProvider, ConfigProvider, did } from '@portkey/did-ui-react';
// import { Telegram_Link_Params } from '@portkey/did-ui-react/src/constants/telegram';
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
  // const TelegramInitDataRef = useRef<any>();

  const getTelegram = useCallback(async () => {
    if (typeof window !== 'undefined') {
      await sleep(1000);

      TelegramRef.current = (window as any)?.Telegram; // window.Telegram.WebApp
      if (!TelegramRef.current) return;

      TelegramRef.current.WebApp.ready();

      // TelegramRef.current.WebApp.CloudStorage.setItem('auth_test', '123456');
      // const authTest =
      //   TelegramRef.current.WebApp.CloudStorage.getItem("auth_test");
      // console.log("dapp authTest", authTest);

      // const { initData } = TelegramRef.current.WebApp;
      // TelegramInitDataRef.current = qs.parse(initData);
      // if (initData?.start_param) {
      //   // get step from localStorage
      // }
    }
  }, []);

  useEffectOnce(() => {
    getTelegram();
  });

  const openSignIn = useCallback(() => {
    signInRef.current?.setOpen(true);
  }, []);

  const onCancel = useCallback(() => signInRef.current?.setOpen(false), [signInRef]);

  const onFinish = useCallback(async (didWallet: DIDWalletInfo) => {
    console.log('didWallet', didWallet);
    did.save(didWallet.pin);
  }, []);

  const sendData = useCallback(() => {
    TelegramRef.current.WebApp.sendData('12345');
  }, []);

  const openTgLoginIFrame = useCallback(() => {
    const url = 'https://t.me/sTestABot/aelf?startapp=clientId'; //`https://t.me/Dapp_V5_Bot/dappv5?startapp=clientId`
    TelegramRef.current.WebApp.openTelegramLink(url);
  }, []);

  return (
    <div>
      <Button onClick={openSignIn}>sign in</Button>
      <Button onClick={sendData}>send data</Button>
      <Button onClick={openTgLoginIFrame}>open Portkey webapp</Button>
      <a href="assets">
        <Button>Go to assets</Button>
      </a>
      <PortkeyProvider networkType={'TESTNET'}>
        <SignIn
          className="dapp-bot-sign"
          termsOfService={termsOfService}
          privacyPolicy={privacyPolicy}
          uiType="Full"
          ref={signInRef}
          onFinish={onFinish}
          onCancel={onCancel}
        />
      </PortkeyProvider>
    </div>
  );
}
