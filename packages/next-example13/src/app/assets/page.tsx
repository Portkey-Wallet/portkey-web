'use client';

import { ConfigProvider, Asset, PortkeyAssetProvider } from '@portkey-v1/did-ui-react';
import React from 'react';

ConfigProvider.setGlobalConfig({
  // storageMethod: myStore,
  serviceUrl: 'https://localtest-applesign2.portkey.finance',

  requestDefaults: {
    timeout: 30000,
  },
});

export default function Assets() {
  return (
    <PortkeyAssetProvider pin="111111" originChainId="AELF">
      <Asset
        faucet={{
          faucetContractAddress: '2UM9eusxdRyCztbmMZadGXzwgwKfFdk8pF4ckw58D769ehaPSR',
        }}
        onLifeCycleChange={lifeCycle => {
          console.log(lifeCycle, 'onLifeCycleChange');
        }}
      />
    </PortkeyAssetProvider>
  );
}
