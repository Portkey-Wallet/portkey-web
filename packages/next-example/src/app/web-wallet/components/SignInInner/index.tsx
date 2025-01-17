import {
  AddManagerType,
  CreatePendingInfo,
  DIDWalletInfo,
  IGuardianIdentifierInfo,
  ISignIn,
  Loading,
  SignIn,
  TOnSuccessExtraData,
  TStep1LifeCycle,
  TStep2SignInLifeCycle,
  TStep2SignUpLifeCycle,
  TStep3LifeCycle,
  did,
  useLoginWallet,
  useSignHandler,
  useSignInHandler,
} from '@portkey/did-ui-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWebWallet } from '../../context/WalletProvider';
import { DEFAULT_PIN } from '../../constants/wallet';
import { basicWebWalletView } from '../../context/WalletProvider/actions';
import OpenPageService from '../../service/OpenPageService';
import SWEventController from '../../controllers/EventController/SWEventController';
import { useWalletDispatch } from '../../context/WalletProvider/hooks';
import { getWebWalletStorageKey } from '../../utils/wallet';
import { OperationTypeEnum, SocialLoginType, TSignUpVerifier, WalletPageType } from '../../types';
import useVerifier from '../../hooks/useVerifier';
import { ChainId } from '@portkey/provider-types';

let CHAIN_ID: ChainId = 'tDVW';

export default function SignInInner({ onLoginErrorCb }: { onLoginErrorCb: () => void }) {
  const ref = useRef<ISignIn>();
  const [{ pageState, options }] = useWebWallet();
  const extraDataRef = useRef<TOnSuccessExtraData>();
  const dispatch = useWalletDispatch();
  const { getRecommendationVerifier, verifySocialToken } = useVerifier();
  const [currentLifeCircle, setCurrentLifeCircle] = useState<
    TStep2SignInLifeCycle | TStep1LifeCycle | TStep3LifeCycle | TStep2SignUpLifeCycle
  >({});

  const beforeCreatePending = useCallback(() => {
    if (options?.isTelegram && extraDataRef.current?.originChainId) {
      dispatch(basicWebWalletView.setWalletPin.actions(DEFAULT_PIN));
      pageState && OpenPageService.closePage(pageState.eventName, { error: 0 });
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
        did.save(DEFAULT_PIN, getWebWalletStorageKey(options?.appId));
        pageState && OpenPageService.closePage(pageState.eventName, { error: 0 });
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
      pageState && OpenPageService.closePage(pageState.eventName, { error: 0 });
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
          pin: DEFAULT_PIN,
          type: 'register' as AddManagerType,
          chainId: extraDataRef.current?.originChainId || 'tDVW',
          accountType: identifier?.accountType,
          guardianIdentifier: identifier?.identifier,
          guardianApprovedList: list,
        };
        const res = await createWallet(params);
        did.save(DEFAULT_PIN, getWebWalletStorageKey(options?.appId));
        dispatch(basicWebWalletView.setWalletPin.actions(DEFAULT_PIN));
        pageState && OpenPageService.closePage(pageState.eventName, { error: 0 });
        SWEventController.dispatchEvent({ eventName: 'connected', data: { chainIds: [res?.chainId] } });
      } else {
        setCurrentLifeCircle({
          SetPinAndAddManager: {
            guardianIdentifierInfo: identifier,
            approvedList: list,
          },
        });
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
            chainId: extraDataRef.current?.originChainId || 'tDVV',
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
              pin: DEFAULT_PIN,
              type,
              chainId: guardianIdentifierInfo.chainId,
              accountType: guardianIdentifierInfo.accountType,
              guardianIdentifier: guardianIdentifierInfo?.identifier,
              guardianApprovedList: approvedList,
            };
            const res = await createWallet(params);
            console.log('single guardian login in tg', res);
          } catch (e) {
            onLoginErrorCb();
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
              pin: DEFAULT_PIN,
              type: 'recovery' as AddManagerType,
              chainId: extraData?.originChainId || CHAIN_ID,
              accountType: signResult.value.guardianIdentifierInfo?.accountType,
              guardianIdentifier: signResult.value.guardianIdentifierInfo?.identifier,
              guardianApprovedList: signResult.value.approvedList ?? [],
              source: 5,
            };
            try {
              const res = await createWallet(params);
              console.log('multiply guardian login in tg', res);
              return;
            } catch (error) {
              onLoginErrorCb();
              console.log('error', error);
            }
          }
          console.log('login for web', signResult);
          setCurrentLifeCircle({
            [signResult.nextStep as any]: signResult.value,
          });
          console.log('multiply guardian login');
        }
      }
    },
    [createWallet, onLoginErrorCb, onSignInHandler, onSignUp, options?.isTelegram],
  );
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

  const showSign = useMemo(() => {
    if (pageState?.pageType === WalletPageType.Login) return true;
    if (pageState?.pageType === WalletPageType.CustomLogin) {
      if (Object.keys(currentLifeCircle).length !== 0) {
        return true;
      }
      return false;
    }
    return true;
  }, [currentLifeCircle, pageState?.pageType]);

  const showPageLoading = useMemo(
    () => pageState?.pageType === WalletPageType.CustomLogin && Object.keys(currentLifeCircle).length === 0,
    [currentLifeCircle, pageState?.pageType],
  );

  return (
    <div>
      {showSign && (
        <SignIn
          ref={ref}
          keyboard={true}
          design={'CryptoDesign'}
          uiType={'Full'}
          defaultChainId={options?.networkType === 'MAINNET' ? 'tDVV' : 'tDVW'}
          defaultLifeCycle={currentLifeCircle}
          onFinish={onSignInFinish}
          beforeCreatePending={beforeCreatePending}
          onCreatePending={onCreatePending}
          onError={error => {
            console.log(error, 'onError====error');
          }}
        />
      )}
      {showPageLoading && <Loading />}
    </div>
  );
}
