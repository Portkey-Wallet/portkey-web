'use client';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  did,
  PortkeyAssetProvider,
  Asset,
  GuardianApproval,
  getOperationDetails,
  NetworkType,
  GuardianAdd,
  CustomSvg,
  formatGuardianValue,
  ManagerApproveInner,
  UserGuardianStatus,
} from '@portkey/did-ui-react';
import { ChainId } from '@portkey/types';
import { Button } from 'antd';
import { useWebWallet, WalletProvider } from './context/WalletProvider';
import { OperationTypeEnum, WalletPageType } from './types';
import { OpenPageService } from './service/OpenPageService';
import { getWebWalletStorageKey } from './utils/wallet';
import { useWalletDispatch } from './context/WalletProvider/hooks';
import { basicWebWalletView } from './context/WalletProvider/actions';
import SWEventController from './controllers/EventController/SWEventController';
import SignInInner from './components/SignInInner';
import { GuardiansApproved } from '@portkey/services';

import UnlockInner from './components/UnlockInner';
import { ProviderError, ResponseCode, ResponseMessagePreset } from '@portkey/provider-types';
import errorHandler from './utils/errorHandler';
import { clearManagerReadOnly } from './utils/clearManagerReadOnly';
import useVerifier from './hooks/useVerifier';
import useGuardianList from './hooks/guardian';
import { addGuardian } from './utils/guardian';

function WebPageInner() {
  const [{ pageState, pin, options }] = useWebWallet();
  console.log(pageState, 'pageState====');
  const dispatch = useWalletDispatch();
  const guardianListForLogin = JSON.parse(localStorage.getItem('guardianListForLogin') || '[]');

  const { verifierList, getVerifierList } = useVerifier();
  const { currentGuardianList, getCurrentGuardianList } = useGuardianList();

  const AddGuardianApproveList = useMemo(() => {
    return currentGuardianList.map(ele => {
      const _v = verifierList.find(v => v.id === ele.verifierId);
      return { ...ele, verifier: _v };
    });
  }, [currentGuardianList, verifierList]);

  const onDisconnect = useCallback(() => {
    localStorage.removeItem(getWebWalletStorageKey(options?.appId));
    localStorage.removeItem('guardianListForLogin');
    localStorage.removeItem('guardianListForAddGuardian');

    did.reset();
    SWEventController.dispatchEvent({
      eventName: 'disconnected',
      data: { message: 'user logout' },
    });
    pageState &&
      OpenPageService.closePage(
        pageState.eventName,
        errorHandler(200004, new ProviderError(ResponseMessagePreset['USER_DENIED'], ResponseCode.USER_DENIED)),
      );
  }, [options?.appId, pageState]);

  const onTGSignInApprovalSuccess = useCallback(
    async (guardiansApproved: GuardiansApproved[]) => {
      console.log('guardiansApproved', guardiansApproved);
      const formatGuardianApprove = formatGuardianValue(guardiansApproved);
      const caHash = pageState?.data.caHash;
      const targetChainId = pageState?.data.targetChainId;
      const chainIds = Object.keys(did.didWallet.chainsInfo || {});
      const otherChainId = chainIds.find(item => item !== targetChainId);
      const res = await clearManagerReadOnly({
        caHash,
        chainId: targetChainId,
        guardiansApproved: formatGuardianApprove,
      });
      if (otherChainId) {
        await clearManagerReadOnly({
          caHash,
          chainId: otherChainId as ChainId,
          guardiansApproved: formatGuardianApprove,
        });
      }
      localStorage.removeItem('guardianListForLogin');
      pageState && OpenPageService.closePage(pageState.eventName, { error: 0, data: res });
    },
    [pageState],
  );

  const onUnlock = useCallback(
    async (pin: string) => {
      dispatch(basicWebWalletView.setWalletPin.actions(pin));
      pageState && OpenPageService.closePage(pageState.eventName, { error: 0, data: pin });
      SWEventController.dispatchEvent({
        eventName: 'connected',
        data: { chainIds: [did.didWallet.originChainId] },
      });
    },
    [dispatch, pageState],
  );

  const handleAddGuardian = useCallback(
    async (currentGuardian: UserGuardianStatus, approvalInfo: GuardiansApproved[]) => {
      await addGuardian({
        targetChainId: pageState?.data?.targetChainId,
        caHash: pageState?.data?.caHash,
        currentGuardian,
        guardiansApprovedList: approvalInfo,
      });
      await getCurrentGuardianList(pageState?.data?.originChainId, pageState?.data?.caHash);
      pageState && OpenPageService.closePage(pageState.eventName, { error: 0, data: { status: true } });
    },
    [getCurrentGuardianList, pageState],
  );

  useEffect(() => {
    if (pageState?.data?.originChainId || pageState?.data?.caHash) {
      getVerifierList(pageState?.data?.originChainId);
      getCurrentGuardianList(pageState?.data?.originChainId, pageState?.data?.caHash);
    }
  }, [getCurrentGuardianList, getVerifierList, pageState?.data?.caHash, pageState?.data?.originChainId]);

  return (
    <PortkeyAssetProvider pin={pin} originChainId={did?.didWallet?.originChainId || 'AELF'}>
      <div>
        <div
          className="portkey-ui-flex portkey-ui-flex-center"
          onClick={() => {
            pageState &&
              OpenPageService.closePage(
                pageState.eventName,
                errorHandler(200003, new ProviderError(ResponseMessagePreset['USER_DENIED'], ResponseCode.USER_DENIED)),
              );
          }}>
          <CustomSvg type="Close2" style={{ width: 30, height: 30 }} />
          close page
        </div>

        {(pageState?.pageType === WalletPageType.Login || pageState?.pageType === WalletPageType.CustomLogin) && (
          <SignInInner onLoginErrorCb={onDisconnect} />
        )}

        <div>-----------</div>
        {/* TODO: just for telegram */}
        {pageState?.pageType === WalletPageType.GuardianApproveForLogin && pageState.data && (
          <GuardianApproval
            guardianList={guardianListForLogin}
            networkType={pageState.data.networkType as NetworkType}
            caHash={pageState.data.caHash}
            originChainId={pageState.data.originChainId}
            targetChainId={pageState.data.targetChainId}
            operationType={OperationTypeEnum.communityRecovery}
            operationDetails={getOperationDetails(OperationTypeEnum.communityRecovery)}
            onConfirm={onTGSignInApprovalSuccess}
          />
        )}

        <div>-----------</div>
        {pageState?.pageType === WalletPageType.AddGuardian && (
          <GuardianAdd
            caHash={pageState?.data?.caHash}
            originChainId={pageState?.data?.originChainId}
            guardianList={AddGuardianApproveList}
            verifierList={verifierList}
            networkType={pageState?.data?.networkType as NetworkType}
            handleAddGuardian={handleAddGuardian}
          />
        )}

        <div>-----------</div>
        {pageState?.pageType === WalletPageType.SetAllowance && (
          <ManagerApproveInner
            caHash={pageState.data.caHash}
            symbol={pageState.data.symbol}
            amount={pageState.data.amount}
            originChainId={pageState.data.originChainId}
            targetChainId={pageState.data.targetChainId}
            networkType={pageState.data.networkType}
          />
        )}

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
          <>
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
          </>
        )}
        {pageState?.pageType === WalletPageType.UnLock && (
          <UnlockInner onUnlock={onUnlock} onForgetPin={onDisconnect} />
        )}
      </div>
    </PortkeyAssetProvider>
  );
}

export default function Page() {
  return (
    <WalletProvider>
      <WebPageInner />
    </WalletProvider>
  );
}
