import { PortkeyProvider, NetworkType } from '@portkey/did-ui-react';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PageRouter } from './routes';
import './theme.css';

function Index() {
  const [dark, setDark] = useState<boolean>(false);
  const [networkType, setNetworkType] = useState<NetworkType>('MAINNET');

  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [dark]);

  return (
    <PortkeyProvider networkType={networkType} theme={dark ? 'dark' : 'light'}>
      <div style={{ background: dark ? '#1E212B' : '#fff' }} id={dark && 'ids'}>
        <button
          onClick={async () => {
            setDark(v => !v);
          }}>
          change theme
        </button>
        <button
          onClick={async () => {
            setNetworkType(v => (v === 'MAINNET' ? 'TESTNET' : 'MAINNET'));
          }}>
          Only change networkType
        </button>
        <PageRouter />
      </div>
    </PortkeyProvider>
  );
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Index />
    </BrowserRouter>
  </React.StrictMode>,
);
