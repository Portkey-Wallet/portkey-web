'use client';
import { ConfigProvider, PortkeyAssetProvider } from '@portkey/did-ui-react';
import React from 'react';
import { Guardian } from '@portkey/did-ui-react';
import { ChainId } from '@portkey/types';
// import { Store } from '../../utils';
// const myStore = new Store();

ConfigProvider.setGlobalConfig({
  // storageMethod: myStore,
  serviceUrl: 'https://localtest-applesign2.portkey.finance',

  requestDefaults: {
    timeout: 30000,
  },
});

export default function Assets() {
  const props = {
    caHash: 'a79c76fd18879943980b9909f46ea644f9cd02eee5069d645d7046a874f7e212',
    originChainId: 'AELF' as ChainId,
  };
  return (
    <PortkeyAssetProvider pin="111111" originChainId="AELF">
      <Guardian {...props} />
    </PortkeyAssetProvider>
  );
}
