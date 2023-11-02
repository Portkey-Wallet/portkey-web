'use client';
import { NetworkType, PortkeyProvider } from '@portkey/did-ui-react';
import React, { ReactNode, useState, useEffect } from 'react';
import { Button } from 'antd';
import '@portkey/did-ui-react/dist/assets/index.css';

export default function Portkey({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState<boolean>(false);
  const [networkType, setNetworkType] = useState<NetworkType>('MAIN');

  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [dark]);

  return (
    <PortkeyProvider networkType={networkType} theme={dark ? 'dark' : 'light'}>
      <div style={{ background: dark ? '#1E212B' : '#fff' }} id={dark ? 'ids' : ''}>
        <Button
          type="primary"
          onClick={async () => {
            setDark(v => !v);
          }}>
          change theme
        </Button>
        <Button
          onClick={async () => {
            setNetworkType(v => (v === 'MAIN' ? 'TESTNET' : 'MAIN'));
          }}>
          Only change networkType
        </Button>
      </div>
      {children}
    </PortkeyProvider>
  );
}
