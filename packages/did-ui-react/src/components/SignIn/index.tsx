/**
 * @file
 *
 * First you have to configure networkList using ConfigProvider.setGlobalConfig
 */

import BaseModal from '../SignStep/components/BaseModal';
import { useState, useCallback, useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import ConfigProvider from '../config-provider';
import Step1, { OnSignInFinishedFun } from '../SignStep/components/Step1';
import Step2OfSignUp from '../SignStep/components/Step2OfSignUp';
import Step2OfLogin from '../SignStep/components/Step2OfLogin';
import Step3 from '../SignStep/components/Step3';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import useChainInfo from '../../hooks/useChainInfo';
import useNetworkList from '../../hooks/useNetworkList';
import type {
  IVerifyInfo,
  DIDWalletInfo,
  SignInSuccess,
  IPhoneCountry,
  AddManagerType,
  LoginFinishWithoutPin,
} from '../types';
import type { ChainId } from '@portkey/types';
import type { GuardiansApproved } from '@portkey/services';
import type { VerifierItem } from '@portkey/did';
import {
  LifeCycleType,
  SignInLifeCycleType,
  SIGN_IN_STEP,
  Step2SignUpLifeCycleType,
  SignInProps,
} from '../SignStep/types';
import { portkeyDidUIPrefix } from '../../constants';
import qs from 'query-string';
import clsx from 'clsx';
import { did, errorTip } from '../../utils';
import BaseStyleProvider from '../BaseStyleProvider';
import './index.less';
import { currentStep, step1Storage, step3Storage } from '../SignStep/contsants';

export const LifeCycleMap: { [x in SIGN_IN_STEP]: LifeCycleType[] } = {
  SignIn: ['SignUp', 'Login', 'LoginByScan'],
  Step2OfSignUp: ['VerifierSelect', 'CodeVerify'],
  Step2OfLogin: ['GuardianApproval'],
  Step3: ['SetPinAndAddManager'],
};

type TSignUpVerifier = { verifier: VerifierItem } & IVerifyInfo;

const SignIn = forwardRef(
  (
    {
      defaultChainId = 'AELF',
      isErrorTip = true,
      // If you set isShowScan to true, make sure you configure ConfigProvider.setGlobalConfig `network`
      isShowScan,
      sandboxId,
      phoneCountry: defaultPhoneCountry,
      extraElement,
      termsOfService,
      design = 'CryptoDesign',
      validateEmail,
      validatePhone,
      uiType = 'Modal',
      className,
      getContainer,
      onLifeCycleChange,
      onChainIdChange,
      onNetworkChange,
      onCreatePending,
      onCancel,
      onFinish,
      onError,
    }: SignInProps,
    ref,
  ) => {
    const [step, setStep] = useState<SIGN_IN_STEP>();
    const [guardianIdentifierInfo, setGuardianIdentifierInfo] = useState<SignInSuccess>();
    const onErrorRef = useRef<SignInProps['onError']>(onError);
    const onFinishRef = useRef<SignInProps['onFinish']>(onFinish);
    const onNetworkChangeRef = useRef<SignInProps['onNetworkChange']>(onNetworkChange);
    const onChainIdChangeRef = useRef<SignInProps['onChainIdChange']>(onChainIdChange);

    useEffect(() => {
      onErrorRef.current = onError;
      onFinishRef.current = onFinish;
      onNetworkChangeRef.current = onNetworkChange;
      onChainIdChangeRef.current = onChainIdChange;
    });

    const { network, networkList } = useNetworkList();
    const [open, setOpen] = useState<boolean>(false);

    const refSetOpen = useCallback((v: boolean) => {
      setStep('SignIn');
      setOpen(v);
    }, []);

    useImperativeHandle(ref, () => ({ setOpen: refSetOpen }));

    const networkItem = useMemo(
      () => networkList?.find((item) => item.networkType === network),
      [network, networkList],
    );
    const [originChainId, setOriginChainId] = useState<ChainId>();
    const [approvedList, setApprovedList] = useState<GuardiansApproved[]>();
    const [walletWithoutPin, setWalletWithoutPin] = useState<Omit<DIDWalletInfo, 'pin'>>();
    const [lifeCycle, setLifeCycle] = useState<LifeCycleType>('Login');

    const chainId = useMemo(() => originChainId || defaultChainId, [originChainId, defaultChainId]);
    const chainInfo = useChainInfo(chainId, onErrorRef?.current);

    const getStorageGuardianApproved = useCallback(async () => {
      const storageStr = await ConfigProvider.config.storageMethod?.getItem(step3Storage);
      if (!storageStr) return;
      const approvedStorageList: GuardiansApproved[] = JSON.parse(storageStr);
      if (!approvedList) setApprovedList(approvedStorageList);
    }, [approvedList]);

    const dealStep = useCallback(async () => {
      // When the location.search has an id_token, we think it is authorized by Apple and returned to the page
      const { id_token } = qs.parse(location.search);
      if (uiType === 'Modal' && id_token) setOpen(true);

      const currentlifeCycle = await ConfigProvider.config.storageMethod?.getItem(currentStep);
      if (!currentlifeCycle) {
        setStep('SignIn');
        return;
      }
      const step1StorageStr = await ConfigProvider.config.storageMethod?.getItem(step1Storage);
      const step1StorageInfo = JSON.parse(step1StorageStr);
      step1StorageInfo && setGuardianIdentifierInfo(step1StorageInfo);
      Object.entries(LifeCycleMap).forEach(([key, value]) => {
        const _key = key as SIGN_IN_STEP;
        if (value.includes(currentlifeCycle)) {
          setStep(_key);
          if (_key === 'Step3') getStorageGuardianApproved();
        }
      });
    }, [getStorageGuardianApproved, uiType]);

    useEffectOnce(() => {
      dealStep();
    });

    const onSignInFinished: OnSignInFinishedFun = useCallback((result) => {
      const { type, value } = result.result;
      if (result.isFinished) {
        // Sign in by scan
        onFinishRef?.current?.(value as DIDWalletInfo);
      } else {
        if (type === 'SignUp') {
          setStep('Step2OfSignUp');
        } else {
          setStep('Step2OfLogin');
        }
        setApprovedList(undefined);
        setGuardianIdentifierInfo(value as SignInSuccess);
        ConfigProvider.config.storageMethod?.setItem(step1Storage, JSON.stringify(value));
      }
    }, []);

    const onStep2OfSignUpFinish = useCallback(
      (res: TSignUpVerifier) => {
        if (!guardianIdentifierInfo) return console.error('No guardianIdentifier!');
        const list = [
          {
            type: guardianIdentifierInfo?.accountType,
            identifier: guardianIdentifierInfo.identifier,
            verifierId: res.verifier.id,
            verificationDoc: res.verificationDoc,
            signature: res.signature,
          },
        ];
        setApprovedList(list);
        setStep('Step3');
      },
      [guardianIdentifierInfo],
    );

    const onStep2Cancel = useCallback(() => {
      setStep('SignIn');
      setApprovedList(undefined);
    }, []);

    const onStep3Cancel = useCallback((v?: AddManagerType) => {
      if (v === 'register') {
        setStep('Step2OfSignUp');
        setApprovedList(undefined);
      } else if (v === 'recovery') {
        setStep('Step2OfLogin');
      } else {
        setStep('SignIn');
      }
    }, []);

    const clearStorage = useCallback(() => {
      ConfigProvider.config.storageMethod?.removeItem(currentStep);
      ConfigProvider.config.storageMethod?.removeItem(step1Storage);
      ConfigProvider.config.storageMethod?.removeItem(step3Storage);
      ConfigProvider.config.storageMethod?.removeItem(`${portkeyDidUIPrefix}GuardianListInfo`);
      setWalletWithoutPin(undefined);
      setGuardianIdentifierInfo(undefined);
      setOriginChainId(undefined);
      setApprovedList(undefined);
    }, []);

    const onLoginFinishWithoutPin: LoginFinishWithoutPin = useCallback((wallet) => {
      setWalletWithoutPin(wallet);
      setStep('Step3');
    }, []);

    const onSignUpStepChange = useCallback((v: Step2SignUpLifeCycleType) => setLifeCycle(v), []);

    const onSignInStepChange = useCallback((v: SignInLifeCycleType) => setLifeCycle(v), []);

    const onOriginChainIdChange = useCallback((v?: ChainId) => {
      v && setOriginChainId(v);
      v && onChainIdChangeRef?.current?.(v);
    }, []);

    const onStep3Finish = useCallback(
      (v: DIDWalletInfo | string) => {
        if (typeof v === 'string') {
          if (!walletWithoutPin)
            return errorTip(
              {
                errorFields: 'SetPinAndAddManagerCom',
                error: 'set pin error',
              },
              isErrorTip,
              onError,
            );
          onFinishRef?.current?.({ ...walletWithoutPin, pin: v });
        } else {
          onFinishRef?.current?.(v);
        }
        setOpen(false);
        setStep('SignIn');
        clearStorage();
      },
      [clearStorage, isErrorTip, onError, walletWithoutPin],
    );

    useUpdateEffect(() => {
      if (!approvedList) ConfigProvider.config.storageMethod?.removeItem(step3Storage);
      approvedList && ConfigProvider.config.storageMethod?.setItem(step3Storage, JSON.stringify(approvedList));
    }, [approvedList]);

    useUpdateEffect(() => {
      if (step === 'SignIn') {
        setLifeCycle('Login');
        ConfigProvider.config.storageMethod?.removeItem(step1Storage);
      }
      if (step === 'Step2OfLogin') setLifeCycle('GuardianApproval');
      if (step === 'Step2OfSignUp') setLifeCycle('VerifierSelect');
      if (step === 'Step3') setLifeCycle('SetPinAndAddManager');
    }, [step]);

    useUpdateEffect(() => {
      onLifeCycleChange?.(lifeCycle);
      ConfigProvider.config.storageMethod?.setItem(currentStep, lifeCycle);
    }, [lifeCycle]);

    const onModalCancel = useCallback(() => {
      onCancel?.();
      clearStorage();
      setOpen(false);
      setStep('SignIn');
    }, [clearStorage, onCancel]);

    const [phoneCountry, setPhoneCountry] = useState<IPhoneCountry | undefined>(defaultPhoneCountry);

    const getPhoneCountry = useCallback(async () => {
      try {
        const countryData = await did.services.getPhoneCountryCodeWithLocal();
        setPhoneCountry({ iso: countryData.locateData?.iso || '', countryList: countryData.data || [] });
      } catch (error) {
        errorTip(
          {
            errorFields: 'getPhoneCountry',
            error,
          },
          isErrorTip,
          onError,
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      // Get phoneCountry by service, update phoneCountry
      getPhoneCountry();
    }, [getPhoneCountry]);

    const mainContent = useCallback(() => {
      return (
        <>
          {step === 'SignIn' && (
            <Step1
              isShowScan={isShowScan}
              design={design}
              defaultChainId={defaultChainId}
              isErrorTip={isErrorTip}
              onError={onErrorRef?.current}
              phoneCountry={phoneCountry}
              extraElement={extraElement}
              validateEmail={validateEmail}
              validatePhone={validatePhone}
              onSignInFinished={onSignInFinished}
              onNetworkChange={onNetworkChangeRef?.current}
              onStepChange={onSignInStepChange}
              onChainIdChange={onOriginChainIdChange}
              onLoginFinishWithoutPin={onLoginFinishWithoutPin}
              termsOfService={termsOfService}
            />
          )}

          {step === 'Step2OfSignUp' && guardianIdentifierInfo && (
            <Step2OfSignUp
              guardianIdentifierInfo={guardianIdentifierInfo}
              isErrorTip={isErrorTip}
              sandboxId={sandboxId}
              chainType={networkItem?.walletType}
              chainInfo={chainInfo}
              onStepChange={onSignUpStepChange}
              onError={onErrorRef?.current}
              onFinish={onStep2OfSignUpFinish}
              onCancel={onStep2Cancel}
            />
          )}
          {step === 'Step2OfLogin' && guardianIdentifierInfo && (
            <Step2OfLogin
              approvedList={approvedList}
              sandboxId={sandboxId}
              chainType={networkItem?.walletType}
              chainInfo={chainInfo}
              guardianIdentifierInfo={guardianIdentifierInfo}
              isErrorTip={isErrorTip}
              onError={onErrorRef?.current}
              onFinish={(list) => {
                setApprovedList(list);
                setStep('Step3');
              }}
              onCancel={onStep2Cancel}
            />
          )}

          {step === 'Step3' && (
            <Step3
              guardianIdentifierInfo={guardianIdentifierInfo}
              onlyGetPin={Boolean(walletWithoutPin)}
              type={guardianIdentifierInfo?.isLoginIdentifier ? 'recovery' : 'register'}
              guardianApprovedList={approvedList || []}
              isErrorTip={isErrorTip}
              onError={onErrorRef?.current}
              onFinish={onStep3Finish}
              onCancel={onStep3Cancel}
              onCreatePending={onCreatePending}
            />
          )}
        </>
      );
    }, [
      step,
      isShowScan,
      defaultChainId,
      isErrorTip,
      phoneCountry,
      extraElement,
      validateEmail,
      validatePhone,
      onSignInFinished,
      onSignInStepChange,
      onOriginChainIdChange,
      onLoginFinishWithoutPin,
      termsOfService,
      guardianIdentifierInfo,
      sandboxId,
      networkItem,
      design,
      chainInfo,
      onSignUpStepChange,
      onStep2OfSignUpFinish,
      onStep2Cancel,
      approvedList,
      walletWithoutPin,
      onStep3Finish,
      onStep3Cancel,
      onCreatePending,
    ]);

    return (
      <BaseStyleProvider>
        {uiType === 'Full' ? (
          <div className={clsx('step-page-full-wrapper', className)}>{mainContent()}</div>
        ) : (
          <BaseModal
            destroyOnClose
            className={className}
            open={open}
            getContainer={getContainer}
            onCancel={onModalCancel}>
            {mainContent()}
          </BaseModal>
        )}
      </BaseStyleProvider>
    );
  },
);

export default SignIn;
