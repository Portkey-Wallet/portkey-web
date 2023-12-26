'use client';
import { NetworkType, PortkeyProvider } from '@portkey-v1/did-ui-react';
import { ReactNode, useEffect, useState } from 'react';
import '@portkey-v1/did-ui-react/dist/assets/index.css';
import { Button } from 'antd';
export default function Portkey({ children }: { children?: ReactNode }) {
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
        {children}
      </div>
    </PortkeyProvider>
  );
}
