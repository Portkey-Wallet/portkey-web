'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  did,
  PortkeyAssetProvider,
  Asset,
  DIDWalletInfo,
  CreatePendingInfo,
  IGuardianIdentifierInfo,
  TOnSuccessExtraData,
  useSignInHandler,
  AddManagerType,
  useLoginWallet,
  useSignHandler,
  Loading,
  TStep2SignInLifeCycle,
  TStep1LifeCycle,
  TStep3LifeCycle,
  TStep2SignUpLifeCycle,
  GuardianApproval,
  getOperationDetails,
  NetworkType,
} from '@portkey/did-ui-react';
import { ChainId } from '@portkey/types';
import { Button } from 'antd';
import { useWebWallet, WalletProvider } from './context/WalletProvider';
import { OperationTypeEnum, SocialLoginType, TSignUpVerifier, WalletPageType } from './types';
import { OpenPageService } from './service/OpenPageService';
import { getWebWalletStorageKey } from './utils/wallet';
import { useWalletDispatch } from './context/WalletProvider/hooks';
import { basicWebWalletView } from './context/WalletProvider/actions';
import SWEventController from './controllers/EventController/SWEventController';
import SignInInner from './components/SignInInner';
import { AccountType, GuardiansApproved } from '@portkey/services';
import useVerifier from './hooks/useVerifier';

const PIN = '111111';
let CHAIN_ID: ChainId = 'tDVW';
import UnlockInner from './components/UnlockInner';

function WebPageInner() {
  const [{ pageState, pin, options }] = useWebWallet();
  console.log(pageState, 'pageState====');
  const dispatch = useWalletDispatch();
  const [password, setPassword] = useState<string>('');
  const extraDataRef = useRef<TOnSuccessExtraData>();
  const [innerPage, setInnerPage] = useState<WalletPageType>();
  const [currentLifeCircle, setCurrentLifeCircle] = useState<
    TStep2SignInLifeCycle | TStep1LifeCycle | TStep3LifeCycle | TStep2SignUpLifeCycle
  >({});
  const { getRecommendationVerifier, verifySocialToken } = useVerifier();
  const guardianList = JSON.parse(localStorage.getItem('guardianListForLogin') || '[]');

  const onDisconnect = useCallback(() => {
    localStorage.removeItem(getWebWalletStorageKey(options?.appId));
    did.reset();
    SWEventController.dispatchEvent({
      eventName: 'disconnected',
      data: { message: 'user logout' },
    });
    pageState && OpenPageService.closePage(pageState.eventName);
  }, [options?.appId, pageState]);

  const beforeCreatePending = useCallback(() => {
    if (options?.isTelegram && extraDataRef.current?.originChainId) {
      dispatch(basicWebWalletView.setWalletPin.actions(PIN));
      pageState && OpenPageService.closePage(pageState.eventName);
      SWEventController.dispatchEvent({
        eventName: 'connected',
        data: { chainIds: [extraDataRef.current.originChainId] },
      });
    }
  }, [dispatch, options?.isTelegram, pageState]);

  const onCreatePending = useCallback(
    async (createPendingInfo: CreatePendingInfo) => {
      if (createPendingInfo.createType === 'register') {
        return;
      }
      if (options?.isTelegram) {
        did.save(PIN, getWebWalletStorageKey(options?.appId));
        pageState && OpenPageService.closePage(pageState.eventName);
        SWEventController.dispatchEvent({
          eventName: 'connected',
          data: { chainIds: [createPendingInfo.didWallet?.chainId] },
        });
      }
    },
    [options?.appId, options?.isTelegram, pageState],
  );

  const onSignInFinish = useCallback(
    async (res: DIDWalletInfo) => {
      did.save(res.pin, getWebWalletStorageKey(options?.appId));
      dispatch(basicWebWalletView.setWalletPin.actions(res.pin));
      pageState && OpenPageService.closePage(pageState.eventName);
      SWEventController.dispatchEvent({ eventName: 'connected', data: { chainIds: [res.chainId] } });
    },
    [dispatch, options?.appId, pageState],
  );

  const createWallet = useLoginWallet({
    onCreatePending: onCreatePending,
    onError: error => {
      console.log(error, 'onError====error');
    },
  });

  const onStep2OfSignUpFinish = useCallback(
    async (res: TSignUpVerifier, value?: IGuardianIdentifierInfo) => {
      const identifier = value;
      if (!identifier) return console.error('No guardianIdentifier!');
      const list = [
        {
          type: identifier?.accountType,
          identifier: identifier?.identifier,
          verifierId: res.verifier.id,
          verificationDoc: res.verificationDoc,
          signature: res.signature,
          zkLoginInfo: res.zkLoginInfo,
        },
      ];
      if (options?.isTelegram) {
        const params = {
          pin: PIN,
          type: 'register' as AddManagerType,
          chainId: extraDataRef.current?.originChainId || CHAIN_ID,
          accountType: identifier?.accountType,
          guardianIdentifier: identifier?.identifier,
          guardianApprovedList: list,
        };
        const res = await createWallet(params);
        did.save(PIN, getWebWalletStorageKey(options?.appId));
        dispatch(basicWebWalletView.setWalletPin.actions(PIN));
        pageState && OpenPageService.closePage(pageState.eventName);
        SWEventController.dispatchEvent({ eventName: 'connected', data: { chainIds: [res?.chainId] } });
      } else {
        setCurrentLifeCircle({
          SetPinAndAddManager: {
            guardianIdentifierInfo: identifier,
            approvedList: list,
          },
        });
        setInnerPage(WalletPageType.Login);
      }
    },
    [createWallet, dispatch, options?.appId, options?.isTelegram, pageState],
  );
  const onSignUp = useCallback(
    async (value: IGuardianIdentifierInfo) => {
      try {
        const verifier = await getRecommendationVerifier(extraDataRef.current?.originChainId || CHAIN_ID);
        const { accountType, authenticationInfo, identifier } = value;
        if (
          accountType === SocialLoginType.APPLE ||
          accountType === SocialLoginType.GOOGLE ||
          accountType === SocialLoginType.TELEGRAM
        ) {
          console.log('authenticationInfo', authenticationInfo);
          const operationDetails = JSON.stringify({ manager: did.didWallet.managementAccount?.address });

          const result = await verifySocialToken({
            accountType,
            token: authenticationInfo?.authToken,
            idToken: authenticationInfo?.idToken,
            nonce: authenticationInfo?.nonce,
            timestamp: authenticationInfo?.timestamp,
            guardianIdentifier: identifier,
            verifier,
            chainId: extraDataRef.current?.originChainId || CHAIN_ID,
            operationType: OperationTypeEnum.register,
            operationDetails,
          });
          console.log(result);
          if (!result?.zkLoginInfo && (!result?.signature || !result?.verificationDoc)) {
            throw 'Verify social login error';
          }
          onStep2OfSignUpFinish(
            {
              verifier,
              verificationDoc: result?.verificationDoc,
              signature: result?.signature,
              zkLoginInfo: result?.zkLoginInfo,
            },
            value,
          );
        }
      } catch (error) {
        console.log('onSignUp is: error', error);
      }
    },
    [getRecommendationVerifier, onStep2OfSignUpFinish, verifySocialToken],
  );

  const onSignInHandler = useSignInHandler({ isErrorTip: true });

  const handleSocialStep1Success = useCallback(
    async (value: IGuardianIdentifierInfo, extraData?: TOnSuccessExtraData) => {
      if (extraData) extraDataRef.current = extraData;
      if (!did.didWallet.managementAccount) did.create();
      if (!value.isLoginGuardian) {
        await onSignUp(value as IGuardianIdentifierInfo);
      } else {
        const signResult = await onSignInHandler(value);
        if (!signResult) return;
        if (signResult.nextStep === 'SetPinAndAddManager' && options?.isTelegram) {
          try {
            const guardianIdentifierInfo = signResult.value.guardianIdentifierInfo;
            const approvedList = signResult.value.approvedList;
            if (!approvedList) return;
            const type: AddManagerType = guardianIdentifierInfo?.isLoginGuardian ? 'recovery' : 'register';
            const params = {
              pin: PIN,
              type,
              chainId: guardianIdentifierInfo.chainId,
              accountType: guardianIdentifierInfo.accountType,
              guardianIdentifier: guardianIdentifierInfo?.identifier,
              guardianApprovedList: approvedList,
            };
            const res = await createWallet(params);
          } catch (e) {
            onDisconnect();
            console.log('wallet is: error', e, new Date());
          }
        } else {
          if (options?.isTelegram) {
            const guardianListFromSignResult = signResult.value.guardianList ?? [];
            const resetGuardianList = guardianListFromSignResult.map(ele => {
              return {
                ...ele,
                status: null,
              };
            });
            localStorage.setItem('guardianListForLogin', JSON.stringify(resetGuardianList));
            const params = {
              pin: PIN,
              type: 'recovery' as AddManagerType,
              chainId: extraData?.originChainId || CHAIN_ID,
              accountType: signResult.value.guardianIdentifierInfo?.accountType,
              // accountType: pageState?.data.socialType,
              guardianIdentifier: signResult.value.guardianIdentifierInfo?.identifier,
              guardianApprovedList: signResult.value.approvedList ?? [],
              source: 5,
            };
            try {
              const res = await createWallet(params);
              console.log('handleSocialStep1Success multiply res', res);
              return;
            } catch (error) {
              onDisconnect();
              console.log('error', error);
            }
          }
          console.log('multiply guardian login for web', signResult);

          setCurrentLifeCircle({
            [signResult.nextStep as any]: signResult.value,
          });
          setInnerPage(WalletPageType.Login);
          console.log('multiply guardian login');
        }
      }
    },
    [createWallet, onDisconnect, onSignInHandler, onSignUp, options?.isTelegram],
  );
  console.log('multiply guardian login', currentLifeCircle, innerPage, options?.isTelegram);

  const signHandle = useSignHandler({
    onSuccess: handleSocialStep1Success,
    defaultChainId: CHAIN_ID,
    customValidateEmail: undefined,
    customValidatePhone: undefined,
    onChainIdChange: undefined,
    onError: undefined,
  });

  useEffect(() => {
    if (pageState && pageState.pageType === WalletPageType.CustomLogin) {
      console.log('handleSocialStep1Success pageState', pageState);
      signHandle.onSocialFinish({
        type: pageState.data.payload.socialType,
        data: pageState.data.payload.socialData,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState]);

  const onTGSignInApprovalSuccess = useCallback(
    async (guardianApproved: GuardiansApproved[]) => {
      pageState && OpenPageService.closePage(pageState.eventName);
      console.log('guardianApproved', guardianApproved);
      // SWEventController.dispatchEvent({ eventName: 'connected', data: { chainIds: [res.chainId] } });
      // clearManagerReadonlyStatus
    },
    [pageState],
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

  return (
    <div>
      <div>-----------</div>
      {(pageState?.pageType || innerPage) === WalletPageType.Login && (
        <SignInInner
          beforeCreatePending={beforeCreatePending}
          onCreatePending={onCreatePending}
          onSignInFinish={onSignInFinish}
          defaultLifeCycle={currentLifeCircle}
        />
      )}

      <div>-----------</div>
      {pageState?.pageType === WalletPageType.CustomLogin && <Loading />}

      <div>-----------</div>
      {/* TODO: just for telegram */}
      {pageState?.pageType === WalletPageType.GuardianApproveForLogin && pageState.data && (
        <GuardianApproval
          guardianList={guardianList}
          networkType={pageState.data.network as NetworkType}
          caHash={pageState.data.caHash}
          originChainId={pageState.data.originChainId}
          targetChainId={pageState.data.targetChainId}
          operationType={OperationTypeEnum.communityRecovery}
          operationDetails={getOperationDetails(OperationTypeEnum.communityRecovery)}
          onConfirm={onTGSignInApprovalSuccess}
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
