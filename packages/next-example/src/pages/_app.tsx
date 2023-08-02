import '@portkey/did-ui-react/dist/assets/index.css';
import { PortkeyProvider } from '@portkey/did-ui-react';
import { useEffect, useState } from 'react';
import './index.css';

export default function APP({ Component, pageProps }: any) {
  const [dark, setDark] = useState<boolean>(false);

  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [dark]);

  return (
    <PortkeyProvider networkType={'TESTNET'} theme={dark ? 'dark' : 'light'}>
      <div style={{ background: dark ? '#1E212B' : '#fff' }} id={dark ? 'ids' : ''}>
        {/* <button
          onClick={async () => {
            setDark(v => !v);
          }}>
          change theme
        </button> */}
        <Component {...pageProps} />
      </div>
    </PortkeyProvider>
  );
}
