/**
 * @file
 *
 * First you have to configure networkList using ConfigProvider.setGlobalConfig
 */

import BaseModal from './components/BaseModal';
import { useState, useCallback, useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import ConfigProvider, { BaseConfigProvider } from '../config-provider';
import Step1, { OnSignInFinishedFun } from './components/Step1';
import Step2WithSignUp from './components/Step2WithSignUp';
import Step2WithSignIn from './components/Step2WithSignIn';
import Step3 from './components/Step3';
import { ModalProps } from 'antd';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import useChainInfo from '../../hooks/useChainInfo';
import useNetworkList from '../../hooks/useNetworkList';
import { OnErrorFunc, ValidatorHandler } from '../../types';
import type {
  IVerifyInfo,
  DIDWalletInfo,
  SignInSuccess,
  IPhoneCountry,
  CreatePendingInfo,
  AddManagerType,
  LoginFinishWithoutPin,
} from '../types';
import type { ChainId } from '@portkey/types';
import type { GuardiansApproved } from '@portkey/services';
import type { VerifierItem } from '@portkey/did';
import { LifeCycleType, SignInLifeCycleType, SIGN_IN_STEP, Step2SignUpLifeCycleType } from './types';
import { portkeyDidUIPrefix } from '../../constants';
import qs from 'query-string';
import clsx from 'clsx';
import { errorTip } from '../../utils';
import './index.less';

const step1Storage = `${portkeyDidUIPrefix}step1Storage`;
const currentStep = `${portkeyDidUIPrefix}currentStep`;
const step3Storage = `${portkeyDidUIPrefix}step3`;

export const LifeCycleMap: { [x in SIGN_IN_STEP]: LifeCycleType[] } = {
  SignIn: ['SignUp', 'Login', 'LoginByScan'],
  Step2WithSignUp: ['VerifierSelect', 'CodeVerify'],
  Step2WithSignIn: ['GuardianApproval'],
  Step3: ['SetPinAndAddManager'],
};

type UI_TYPE = 'Modal' | 'Full';

export interface SignInProps {
  defaultChainId?: ChainId;

  sandboxId?: string;
  isErrorTip?: boolean;

  // Login
  isShowScan?: boolean;
  phoneCountry?: IPhoneCountry;
  termsOfServiceUrl?: string;
  validateEmail?: ValidatorHandler;
  validatePhone?: ValidatorHandler;
  onNetworkChange?: (network: string) => void;
  onChainIdChange?: (chainId?: ChainId) => void;
  onLifeCycleChange?: (liftCycle: LifeCycleType) => void;
  onFinish?: (didWallet: DIDWalletInfo) => void;
  onCreatePending?: (createPendingInfo: CreatePendingInfo) => void;

  // UI config
  uiType?: UI_TYPE;

  // Modal config
  className?: string;
  getContainer?: ModalProps['getContainer'];
  onCancel?: () => void;
  onError?: OnErrorFunc;
}

type TSignUpVerifier = { verifier: VerifierItem } & IVerifyInfo;

const SignIn = forwardRef(
  (
    {
      defaultChainId = 'AELF',
      isErrorTip = true,
      // If you set isShowScan to true, make sure you configure ConfigProvider.setGlobalConfig `network`
      isShowScan,
      sandboxId,
      phoneCountry,
      termsOfServiceUrl,
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
    const [_step, setStep] = useState<SIGN_IN_STEP>();
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
    const [_open, setOpen] = useState<boolean>(false);

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

    const chainId = useMemo(() => originChainId || defaultChainId, [originChainId, defaultChainId]);
    const _chainInfo = useChainInfo(chainId, onErrorRef?.current);

    const [approvedList, setApprovedList] = useState<GuardiansApproved[]>();

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
          setStep('Step2WithSignUp');
        } else {
          setStep('Step2WithSignIn');
        }
        setApprovedList(undefined);
        setGuardianIdentifierInfo(value as SignInSuccess);
        ConfigProvider.config.storageMethod?.setItem(step1Storage, JSON.stringify(value));
      }
    }, []);

    const onStep2WithSignUpFinish = useCallback(
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
        setStep('Step2WithSignUp');
        setApprovedList(undefined);
      } else if (v === 'recovery') {
        setStep('Step2WithSignIn');
      } else {
        setStep('SignIn');
      }
    }, []);

    const clearStorage = useCallback(() => {
      ConfigProvider.config.storageMethod?.removeItem(currentStep);
      ConfigProvider.config.storageMethod?.removeItem(step1Storage);
      ConfigProvider.config.storageMethod?.removeItem(step3Storage);
      ConfigProvider.config.storageMethod?.removeItem(`${portkeyDidUIPrefix}GuardianListInfo`);
    }, []);

    const [walletWithoutPin, setWalletWithoutPin] = useState<Omit<DIDWalletInfo, 'pin'>>();

    const onLoginFinishWithoutPin: LoginFinishWithoutPin = useCallback((wallet) => {
      setWalletWithoutPin(wallet);
      setStep('Step3');
    }, []);

    const [lifeCycle, setLifeCycle] = useState<LifeCycleType>('Login');

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
      if (_step === 'SignIn') {
        setLifeCycle('Login');
        ConfigProvider.config.storageMethod?.removeItem(step1Storage);
      }
      if (_step === 'Step2WithSignIn') setLifeCycle('GuardianApproval');
      if (_step === 'Step2WithSignUp') setLifeCycle('VerifierSelect');
      if (_step === 'Step3') setLifeCycle('SetPinAndAddManager');
    }, [_step]);

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

    const mainContent = useCallback(() => {
      return (
        <>
          {_step === 'SignIn' && (
            <Step1
              isShowScan={isShowScan}
              defaultChainId={defaultChainId}
              isErrorTip={isErrorTip}
              onError={onErrorRef?.current}
              phoneCountry={phoneCountry}
              validateEmail={validateEmail}
              validatePhone={validatePhone}
              onSignInFinished={onSignInFinished}
              onNetworkChange={onNetworkChangeRef?.current}
              onStepChange={onSignInStepChange}
              onChainIdChange={onOriginChainIdChange}
              onLoginFinishWithoutPin={onLoginFinishWithoutPin}
              termsOfServiceUrl={termsOfServiceUrl}
            />
          )}

          {_step === 'Step2WithSignUp' && guardianIdentifierInfo && (
            <Step2WithSignUp
              guardianIdentifierInfo={guardianIdentifierInfo}
              isErrorTip={isErrorTip}
              sandboxId={sandboxId}
              chainType={networkItem?.walletType}
              chainInfo={_chainInfo}
              onStepChange={onSignUpStepChange}
              onError={onErrorRef?.current}
              onFinish={onStep2WithSignUpFinish}
              onCancel={onStep2Cancel}
            />
          )}
          {_step === 'Step2WithSignIn' && guardianIdentifierInfo && (
            <Step2WithSignIn
              approvedList={approvedList}
              sandboxId={sandboxId}
              chainType={networkItem?.walletType}
              chainInfo={_chainInfo}
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

          {_step === 'Step3' && (
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
      _step,
      isShowScan,
      defaultChainId,
      isErrorTip,
      phoneCountry,
      validateEmail,
      validatePhone,
      onSignInFinished,
      onSignInStepChange,
      onOriginChainIdChange,
      onLoginFinishWithoutPin,
      termsOfServiceUrl,
      guardianIdentifierInfo,
      sandboxId,
      networkItem?.walletType,
      _chainInfo,
      onSignUpStepChange,
      onStep2WithSignUpFinish,
      onStep2Cancel,
      approvedList,
      walletWithoutPin,
      onStep3Finish,
      onStep3Cancel,
      onCreatePending,
    ]);

    return (
      <BaseConfigProvider>
        {uiType === 'Full' ? (
          <div className={clsx('step-page-full-wrapper', className)}>{mainContent()}</div>
        ) : (
          <BaseModal
            destroyOnClose
            className={className}
            open={_open}
            getContainer={getContainer}
            onCancel={onModalCancel}>
            {mainContent()}
          </BaseModal>
        )}
      </BaseConfigProvider>
    );
  },
);

export default SignIn;
