'use client';

import { ConfigProvider, Asset, PortkeyAssetProvider } from '@portkey/did-ui-react';
import { useRouter } from 'next/navigation';
import React from 'react';

ConfigProvider.setGlobalConfig({
  // storageMethod: myStore,
  serviceUrl: 'https://test4-applesign-v2.portkey.finance',

  requestDefaults: {
    timeout: 30000,
  },
  // loginConfig: {
  //   loginMethodsOrder: ['Email', 'Google', 'Phone', 'Apple', 'Scan'],
  //   recommendIndexes: [0, 1],
  // },
});

export default function Assets() {
  const router = useRouter();
  return (
    <PortkeyAssetProvider pin="111111" originChainId="AELF">
      <Asset
        faucet={{
          faucetContractAddress: '2UM9eusxdRyCztbmMZadGXzwgwKfFdk8pF4ckw58D769ehaPSR',
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
