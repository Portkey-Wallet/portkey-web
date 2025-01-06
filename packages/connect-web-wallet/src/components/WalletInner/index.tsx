import { InitializeProvider, InpagePostStream } from '@portkey/iframe-provider';
import { useCallback, useEffect, useRef } from 'react';
import { useWalletDispatch } from '../../context/ConnectWebWalletProvider/hooks';
import { basicWebWalletView } from '../../context/ConnectWebWalletProvider/actions';
import { useWebWallet } from '../../context/ConnectWebWalletProvider';
import qs from 'qs';

export default function WalletInner() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dispatch = useWalletDispatch();
  const [{ provider, options }] = useWebWallet();
  const onLoad = useCallback(() => {
    if (!iframeRef.current) return console.error('webPage load error');
    const portkeyStream = new InpagePostStream({
      name: 'PORTKEY_WEB_WALLET_INGAGE',
      targetWindow: iframeRef.current!.contentWindow,
    });
    new InitializeProvider({
      connectionStream: portkeyStream,
    });
  }, []);

  useEffect(() => {
    const handler = () => {
      const provider = (window as Record<string, any>).PortkeyWebWallet;
      dispatch(basicWebWalletView.setWalletProvider.actions(provider));
    };
    window.addEventListener('portkeyWebWalletInitEvent', handler);
    return () => {
      window.addEventListener('portkeyWebWalletInitEvent', handler);
    };
  }, [dispatch]);

  return (
    <iframe
      ref={iframeRef}
      src={`https://192.168.1.6:3000/web-wallet?${qs.stringify(options)}`}
      style={{ width: '100%', height: '700px' }}
      onLoad={onLoad}
    />
  );
}
