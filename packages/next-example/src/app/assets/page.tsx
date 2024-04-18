'use client';

import { ConfigProvider, Asset, PortkeyAssetProvider } from '@portkey/did-ui-react';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import React from 'react';

ConfigProvider.setGlobalConfig({
  // storageMethod: myStore,
  requestDefaults: {
    timeout: 30000,
  },
  socialLogin: {
    Telegram: {
      dappTelegramLink: 'https://t.me/Dapp_V5_Bot/dappAssets',
    },
  },
  serviceUrl: 'https://aa-portkey-test.portkey.finance',
  // serviceUrl: 'https://aa-portkey-test.portkey.finance',
  // loginConfig: {
  //   loginMethodsOrder: ['Email', 'Google', 'Phone', 'Apple', 'Scan'],
  //   recommendIndexes: [0, 1],
  // },
});

export default function Assets() {
  const router = useRouter();
  return (
    <PortkeyAssetProvider pin="111111" originChainId="AELF">
      <a href="dapp-webapp">
        <Button>Go to dapp-webapp</Button>
      </a>
      <Asset
        faucet={{
          faucetContractAddress: '233wFn5JbyD4i8R5Me4cW4z6edfFGRn5bpWnGuY8fjR7b2kRsD',
        }}
        onLifeCycleChange={lifeCycle => {
          console.log(lifeCycle, 'onLifeCycleChange');
        }}
        onDeleteAccount={() => {
          router.replace('/sign');
        }}
      />
    </PortkeyAssetProvider>
  );
}
