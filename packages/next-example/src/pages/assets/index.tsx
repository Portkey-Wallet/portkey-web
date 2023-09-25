import { ConfigProvider, Asset, PortkeyAssetProvider } from '@portkey/did-ui-react';
import React from 'react';
// import { Store } from '../../utils';
// const myStore = new Store();

ConfigProvider.setGlobalConfig({
  // storageMethod: myStore,
  serviceUrl: 'http://192.168.66.240:5577',

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
