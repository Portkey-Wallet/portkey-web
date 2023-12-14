import '@portkey/did-ui-react/dist/assets/index.css';
import { NetworkType, PortkeyProvider } from '@portkey/did-ui-react';
import { useEffect, useState } from 'react';
import './index.css';
import { ConfigProvider } from 'antd';

export default function APP({ Component, pageProps }: any) {
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
        <button
          onClick={async () => {
            setDark(v => !v);
          }}>
          change theme
        </button>
        <button
          onClick={async () => {
            setNetworkType(v => (v === 'MAIN' ? 'TESTNET' : 'MAIN'));
          }}>
          Only change networkType
        </button>
        <Component {...pageProps} />
      </div>
    </PortkeyProvider>
  );
}
