'use client';

import { ConfigProvider, Asset, PortkeyAssetProvider, did } from '@portkey/did-ui-react';
import { LoginStatusEnum } from '@portkey/types';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useEffectOnce } from 'react-use';

ConfigProvider.setGlobalConfig({
  // storageMethod: myStore,
  serviceUrl: 'https://aa-portkey-test.portkey.finance',

  requestDefaults: {
    timeout: 30000,
  },
  // serviceUrl: 'https://aa-portkey-test.portkey.finance',
  // loginConfig: {
  //   loginMethodsOrder: ['Email', 'Google', 'Phone', 'Apple', 'Scan'],
  //   recommendIndexes: [0, 1],
  // },
});

export default function Assets() {
  const router = useRouter();
  const checkLoginStatus = async () => {
    const sessionId = JSON.parse(localStorage.getItem('sessionId') || '{}').sessionId;
    if (did.didWallet.isLoginStatus === LoginStatusEnum.INIT) {
      await did.didWallet.getLoginStatus({ sessionId, chainId: did.didWallet.originChainId || 'AELF' });
      did.save('111111');
      localStorage.removeItem('sessionId');
    }
  };
  useEffectOnce(() => {
    checkLoginStatus();
  });
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
