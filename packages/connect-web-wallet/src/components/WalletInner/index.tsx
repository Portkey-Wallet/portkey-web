import { InitializeProvider, InpagePostStream } from '@portkey/iframe-provider';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useWalletDispatch } from '../../context/ConnectWebWalletProvider/hooks';
import { basicWebWalletView } from '../../context/ConnectWebWalletProvider/actions';
import { useWebWallet } from '../../context/ConnectWebWalletProvider';
import qs from 'qs';
import { TelegramPlatform } from '@portkey/utils';
import { IPortkeyProvider, NotificationEvents } from '@portkey/provider-types';
import { useModalDispatch } from '../../context/useModal/hooks';
import { basicModalView } from '../../context/useModal/actions';

export default function WalletInner() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dispatch = useWalletDispatch();
  const modalDispatch = useModalDispatch();
  const [{ options, provider }] = useWebWallet();

  console.log('WalletInner options', options);
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
  const visibleChanged = useCallback(
    (visible: boolean) => {
      console.log(visible, 'visibleChanged==');
      modalDispatch(basicModalView.setWalletDialog.actions(visible));
    },
    [modalDispatch],
  );
  const initListener = useCallback(
    (provider: IPortkeyProvider) => {
      provider.on(NotificationEvents.WALLET_VISIBLE, visibleChanged);
    },
    [visibleChanged],
  );
  const removeListener = useCallback(
    (provider: IPortkeyProvider) => {
      provider.removeListener(NotificationEvents.WALLET_VISIBLE, visibleChanged);
    },
    [visibleChanged],
  );

  useEffect(() => {
    return () => {
      provider && removeListener(provider);
    };
  }, [provider, removeListener]);

  useEffect(() => {
    const handler = () => {
      const provider = (window as Record<string, any>).PortkeyWebWallet;
      dispatch(basicWebWalletView.setWalletProvider.actions(provider));
      initListener(provider);
    };
    window.addEventListener('portkeyWebWalletInitEvent', handler);
    return () => {
      window.addEventListener('portkeyWebWalletInitEvent', handler);
    };
  }, [dispatch, initListener, removeListener]);

  const walletOptions = useMemo(
    () => ({
      ...options,
      isTelegram: TelegramPlatform.isTelegramPlatform(),
    }),
    [options],
  );

  return (
    <iframe
      ref={iframeRef}
      // TODO change online url
      src={`http://localhost:3000/?${qs.stringify(walletOptions)}`}
      style={{ width: '100%', height: '700px' }}
      onLoad={onLoad}
    />
  );
}
