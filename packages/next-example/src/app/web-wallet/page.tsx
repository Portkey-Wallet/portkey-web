'use client';
import React, { useCallback } from 'react';
import { did, PortkeyAssetProvider, Asset, DIDWalletInfo } from '@portkey/did-ui-react';
import { Button } from 'antd';
import { useWebWallet, WalletProvider } from './context/WalletProvider';
import { WalletPageType } from './types';
import { OpenPageService } from './service/OpenPageService';
import { getWebWalletStorageKey } from './utils/wallet';
import { useWalletDispatch } from './context/WalletProvider/hooks';
import { basicWebWalletView } from './context/WalletProvider/actions';
import SWEventController from './controllers/EventController/SWEventController';
import SignInInner from './components/SignInInner';
import UnlockInner from './components/UnlockInner';

function WebPageInner() {
  const [{ pageState, pin, options }] = useWebWallet();
  console.log(pageState, 'pageState====');
  const dispatch = useWalletDispatch();

  const onSignInFinish = useCallback(
    async (res: DIDWalletInfo) => {
      did.save(res.pin, getWebWalletStorageKey(options?.appId));
      dispatch(basicWebWalletView.setWalletPin.actions(res.pin));
      pageState && OpenPageService.closePage(pageState.eventName);
      SWEventController.dispatchEvent({ eventName: 'connected', data: { chainIds: [res.chainId] } });
    },
    [dispatch, options?.appId, pageState],
  );
  const onUnlock = useCallback(
    async (pin: string) => {
      dispatch(basicWebWalletView.setWalletPin.actions(pin));
      pageState && OpenPageService.closePage(pageState.eventName);
      SWEventController.dispatchEvent({
        eventName: 'connected',
        data: { chainIds: [did.didWallet.originChainId] },
      });
    },
    [dispatch, pageState],
  );

  const onDisconnect = useCallback(() => {
    localStorage.removeItem(getWebWalletStorageKey(options?.appId));
    did.reset();
    SWEventController.dispatchEvent({
      eventName: 'disconnected',
      data: { message: 'user logout' },
    });
    pageState && OpenPageService.closePage(pageState.eventName);
  }, [options?.appId, pageState]);
  return (
    <div>
      <div>-----------</div>
      {pageState?.pageType === WalletPageType.Login && <SignInInner onSignInFinish={onSignInFinish} />}

      <div>-----------</div>
      {/* 
      <Button
        onClick={async () => {
          // Mock pin: 111111
          const wallet = await did.load(PIN);
          console.log('wallet:', wallet);
          // Mock chainId: 'AELF'
          const result = await did.logout({ chainId: wallet.didWallet.originChainId ?? CHAIN_ID });
          console.log(result, 'logout====');
        }}>
        logout
      </Button>
      <div>-----------</div>

      <Button
        onClick={async () => {
          // Mock pin: 111111
          const wallet = await did.load(PIN);
          console.log(wallet, 'wallet==load');
        }}>
        load
      </Button> */}

      <div>-----------</div>
      {pageState?.pageType === WalletPageType.Assets && pin && did.didWallet.originChainId && (
        <PortkeyAssetProvider pin={pin} originChainId={did.didWallet.originChainId}>
          <a href="dapp-webapp">
            <Button>Go to dapp-webapp</Button>
          </a>
          <Asset
            faucet={{
              faucetContractAddress: '233wFn5JbyD4i8R5Me4cW4z6edfFGRn5bpWnGuY8fjR7b2kRsD',
            }}
            onDeleteAccount={async () => {
              const wallet = await did.load(pin);
              try {
                await did.logout({ chainId: wallet.didWallet.originChainId ?? 'tDVV' });
              } catch (error) {}
              did.reset();
              onDisconnect();
            }}
          />
        </PortkeyAssetProvider>
      )}
      <div>---------</div>
      {pageState?.pageType === WalletPageType.UnLock && <UnlockInner onUnlock={onUnlock} onForgetPin={onDisconnect} />}
    </div>
  );
}

export default function Page() {
  return (
    <WalletProvider>
      <WebPageInner />
    </WalletProvider>
  );
}
