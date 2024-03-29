'use client';
import { sleep } from '@portkey/utils';
import { useCallback, useRef } from 'react';
import { useEffectOnce } from 'react-use';
import '@portkey/did-ui-react/dist/assets/index.css';
import { Button } from 'antd';
import { did, TelegramLoginButton } from '@portkey/did-ui-react';
import { evokePortkey } from '@portkey/onboarding';

export default function PortkeyWebapp() {
  const TelegramRef = useRef<any>();

  const getTelegram = useCallback(async () => {
    if (typeof window !== 'undefined') {
      await sleep(1000);

      TelegramRef.current = (window as any)?.Telegram;
      if (!TelegramRef.current) return;

      TelegramRef.current.WebApp.ready();

      // const { BackButton, MainButton } = TelegramRef.current.WebApp;
      // BackButton.isVisible = true;
      // MainButton.isVisible = true;
      // TelegramRef.current.WebApp.onEvent('backButtonClicked', (res: any) => {
      //   console.log('backButtonClicked res', res);
      // });
      // TelegramRef.current.WebApp.onEvent('mainButtonClicked', (res: any) => {
      //   console.log('mainButtonClicked res', res);
      // });
    }
  }, []);

  const onJumpDappWebapp = useCallback(() => {
    TelegramRef.current.WebApp.openTelegramLink(`https://t.me/Dapp_V5_Bot/dappv5?startapp=clientId`);
  }, []);

  const checkRegister = useCallback(async (identifier: string) => {
    const { originChainId } = await did.services.getRegisterInfo({
      loginGuardianIdentifier: identifier,
    });
    console.log('originChainId', originChainId);
  }, []);

  useEffectOnce(() => {
    getTelegram();
  });

  return (
    <div>
      <h1>Portkey webapp</h1>
      <Button
        onClick={() => {
          evokePortkey.thirdParty({
            action: 'login',
            isEvokeApp: true,
            custom: {},
          });
        }}>
        evokePortkeyApp
      </Button>
      <Button onClick={() => checkRegister('5990848037')}>checkRegister</Button>
      <Button onClick={onJumpDappWebapp}>Jump Dapp webapp</Button>
      <TelegramLoginButton />
    </div>
  );
}
