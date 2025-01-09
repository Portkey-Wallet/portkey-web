'use client';
import { ConfigProvider, NetworkType, PortkeyProvider } from '@portkey/did-ui-react';
import { ReactNode, useEffect, useState } from 'react';
import '@portkey/did-ui-react/dist/assets/index.css';
import { Button } from 'antd';

ConfigProvider.setGlobalConfig({
  // https://test3-applesign-v2.portkey.finance
  // serviceUrl: 'https://test4-applesign-v2.portkey.finance',
  graphQLUrl: '/graphql',
  customNetworkType: 'online',
});

const EXAMPLE_NETWORK_TYPE = 'exampleNetworkType';

export default function Portkey({ children }: { children?: ReactNode }) {
  const [dark, setDark] = useState<boolean>(false);
  const [networkType, setNetworkType] = useState<NetworkType>('TESTNET');

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (dark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    ConfigProvider.setGlobalConfig({ theme: dark ? 'dark' : 'light' });
  }, [dark]);

  useEffect(() => {
    const storedNetworkType = localStorage.getItem(EXAMPLE_NETWORK_TYPE);
    if (storedNetworkType) {
      setNetworkType(storedNetworkType as NetworkType);
    }
  }, []);

  const handleNetworkTypeChange = () => {
    const newNetworkType = networkType === 'MAINNET' ? 'TESTNET' : 'MAINNET';
    setNetworkType(newNetworkType);
    localStorage.setItem(EXAMPLE_NETWORK_TYPE, newNetworkType);
  };

  return (
    <PortkeyProvider networkType={networkType} theme={dark ? 'dark' : 'light'}>
      <div style={{ background: dark ? '#1E212B' : '#fff', height: '100%' }} id={dark ? 'ids' : ''}>
        <Button
          onClick={async () => {
            setDark(v => !v);
          }}>
          change theme
        </Button>
        <Button onClick={handleNetworkTypeChange}>Only change networkType: {networkType}</Button>

        <Button
          onClick={async () => {
            const VConsole = require('vconsole');
            new VConsole();
          }}>
          VConsole
        </Button>
        {children}
      </div>
    </PortkeyProvider>
  );
}
