'use client';
/**
 * @remarks
 *
 * First you have to configure networkList using ConfigProvider.setGlobalConfig
 */
import { useState, useCallback, useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Step1, { OnSignInFinishedFun } from '../SignStep/components/Step1';
import Step2OfSignUp from '../SignStep/components/Step2OfSignUp';
import Step2OfLogin from '../SignStep/components/Step2OfLogin';
import Step3 from '../SignStep/components/Step3';
import Step2OfSkipGuardianApprove from '../SignStep/components/Step2OfSkipGuardianApprove';
import { useEffectOnce } from 'react-use';
import type {
  IVerifyInfo,
  DIDWalletInfo,
  IGuardianIdentifierInfo,
  AddManagerType,
  LoginFinishWithoutPin,
  TVerifierItem,
} from '../types';
import type { ChainId } from '@portkey/types';
import { OperationTypeEnum, GuardiansApproved, AccountType } from '@portkey/services';
import { LifeCycleType, SignInLifeCycleType, SIGN_IN_STEP, SignInProps, TVerifyCodeInfo } from '../SignStep/types';
import clsx from 'clsx';
import { errorTip, handleErrorMessage, setLoading } from '../../utils';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import { UserGuardianStatus } from '../../types';
import Container from '../Container';
import { usePortkey } from '../context';
import useVerifier from '../../hooks/useVerifier';
import { sleep } from '@portkey/utils';
import CommonBaseModal from '../CommonBaseModal';
import { PORTKEY_ROOT_ID } from '../../constants';
import useSignInHandler, { NextStepType } from './hooks/onSignIn';
import useSendCode from './hooks/useSendCode';
import useLoginWallet from '../../hooks/useLoginWallet';
import './index.less';
import { SocialLoginList, TotalAccountTypeList } from '../../constants/guardian';
import ConfigProvider from '../config-provider';
import { ILoginConfig } from '../config-provider/types';

export const LifeCycleMap: { [x in SIGN_IN_STEP]: LifeCycleType[] } = {
  Step3: ['SetPinAndAddManager'],
  Step2OfLogin: ['GuardianApproval', 'Step2OfSkipGuardianApprove'],
  Step2OfSignUp: ['SignUpCodeVerify'],
  SignIn: ['SignUp', 'Login', 'LoginByScan'],
};

type TSignUpVerifier = { verifier: TVerifierItem } & IVerifyInfo;

const SignIn = forwardRef(
  (
    {
      pin,
      keyboard,
      defaultChainId = 'AELF',
      isErrorTip = true,
      // If you set isShowScan to true, make sure you configure `network`
      isShowScan = true,
      defaultLifeCycle: defaultLifeCycleInfo,
      phoneCountry,
      extraElement,
      extraElementList,
      termsOfService,
      privacyPolicy,
      design = 'CryptoDesign',
      validateEmail,
      validatePhone,
      uiType = 'Modal',
      className,
      getContainer,
      onLifeCycleChange,
      onChainIdChange,
      onCreatePending,
      onCancel,
      onFinish,
      onError,
      onSignUp: onSignUpHandler,
    }: SignInProps,
    ref,
  ) => {
    const [guardianIdentifierInfo, setGuardianIdentifierInfo] = useState<IGuardianIdentifierInfo>();
    const [verifierCodeInfo, setVerifierCodeInfo] = useState<TVerifyCodeInfo>();
    const onErrorRef = useRef<SignInProps['onError']>(onError);
    const onFinishRef = useRef<SignInProps['onFinish']>(onFinish);
    const onChainIdChangeRef = useRef<SignInProps['onChainIdChange']>(onChainIdChange);
    const onLifeCycleChangeRef = useRef<SignInProps['onLifeCycleChange']>(onLifeCycleChange);
    const onSignUpHandlerRef = useRef<SignInProps['onSignUp']>(onSignUpHandler);

    const defaultLifeCycleRef = useRef<LifeCycleType>();
    const defaultLiftCyclePropsRef = useRef<any>();

    const getDefaultLifeCycleProps = useCallback(
      (lifeCycleInfo?: Required<SignInProps['defaultLifeCycle']>) => {
        const lifeCycle = Object.entries(lifeCycleInfo || defaultLifeCycleInfo || {}).slice(-1)[0] || [];
        defaultLifeCycleRef.current = lifeCycle[0] as LifeCycleType;
        defaultLiftCyclePropsRef.current = lifeCycle[1];
        return lifeCycle as [] | [LifeCycleType, any];
      },
      [defaultLifeCycleInfo],
    );

    useMemo(() => getDefaultLifeCycleProps(), [getDefaultLifeCycleProps]);

    useEffect(() => {
      onErrorRef.current = onError;
      onFinishRef.current = onFinish;
      onChainIdChangeRef.current = onChainIdChange;
      onLifeCycleChangeRef.current = onLifeCycleChange;
      onSignUpHandlerRef.current = onSignUpHandler;
    });

    const [{ chainType, networkType }] = usePortkey();
    const [open, setOpen] = useState<boolean>(false);

    const changeLifeCycle: SignInProps['onLifeCycleChange'] = useCallback((v: LifeCycleType, info: any) => {
      setLifeCycle(v);
      onLifeCycleChangeRef.current?.(v, info);
      defaultLifeCycleRef.current = undefined;
      defaultLiftCyclePropsRef.current = undefined;
    }, []);

    const dealStep = useCallback(
      async (lifeCycleInfo?: Required<SignInProps['defaultLifeCycle']>) => {
        try {
          const [defaultLifeCycle, defaultLiftCycleProps] = getDefaultLifeCycleProps(lifeCycleInfo);
          console.log('defaultLifeCycle:dealStep', defaultLifeCycle);

          if (!defaultLifeCycle) return setLifeCycle('Login');
          let flag = false;
          Object.entries(LifeCycleMap).forEach(([key, value]) => {
            if (!flag && value.includes(defaultLifeCycle)) {
              flag = true;
              switch (key) {
                case 'Step3':
                  setApprovedList(defaultLiftCycleProps?.approvedList);
                  setGuardianIdentifierInfo(defaultLiftCycleProps?.guardianIdentifierInfo);
                  // uiType === 'Modal' && setOpen(true);
                  break;
                case 'Step2OfSignUp':
                case 'Step2OfLogin':
                  if (key === 'Step2OfSignUp') setVerifierCodeInfo(defaultLiftCycleProps?.verifyCodeInfo);
                  setGuardianIdentifierInfo(defaultLiftCycleProps?.guardianIdentifierInfo);
                  // uiType === 'Modal' && setOpen(true);
                  break;
                default:
                  changeLifeCycle(defaultLifeCycle, null);
                  break;
              }
              setLifeCycle(defaultLifeCycle);
            }
          });
        } catch (error) {
          console.error('dealStep', error);
          setLifeCycle('Login');
        }
      },
      [changeLifeCycle, getDefaultLifeCycleProps],
    );

    const refSetOpen = useCallback(
      (v: boolean) => {
        dealStep();
        setOpen(v);
      },
      [dealStep],
    );

    const [originChainId, setOriginChainId] = useState<ChainId>();
    const [approvedList, setApprovedList] = useState<GuardiansApproved[]>();
    const [walletWithoutPin, setWalletWithoutPin] = useState<Omit<DIDWalletInfo, 'pin'>>();
    const [lifeCycle, setLifeCycle] = useState<LifeCycleType>(defaultLifeCycleRef.current || 'Login');

    const chainId = useMemo(() => originChainId || defaultChainId, [originChainId, defaultChainId]);

    const setCurrentLifeCycle = useCallback(
      (cycle: Required<SignInProps['defaultLifeCycle']>) => {
        dealStep(cycle);
      },
      [dealStep],
    );
    useImperativeHandle(ref, () => ({ setOpen: refSetOpen, setCurrentLifeCycle: setCurrentLifeCycle }));

    useEffectOnce(() => {
      dealStep(defaultLifeCycleInfo as any);
    });

    const { getRecommendationVerifier, verifySocialToken } = useVerifier();
    const sendCodeConfirm = useSendCode();

    const clearStorage = useCallback(() => {
      setWalletWithoutPin(undefined);
      setGuardianIdentifierInfo(undefined);
      setOriginChainId(undefined);
      setApprovedList(undefined);
    }, []);

    const createWallet = useLoginWallet({
      isErrorTip,
      onError,
      onCreatePending,
    });

    const loginDefaultByPin = useCallback(
      async (
        info: { guardianIdentifierInfo: IGuardianIdentifierInfo; approvedList: GuardiansApproved[] } | null,
        managerWallet?: Omit<DIDWalletInfo, 'pin'>,
      ) => {
        try {
          if (typeof pin !== 'string') throw Error('loginDefaultByPin: Not use default pin');
          let didWallet: any;
          if (info === null) {
            if (!managerWallet) throw Error('loginDefaultByPin: Can not get `managerWallet`');
            didWallet = { ...managerWallet, pin };
          } else {
            const guardianIdentifierInfo = info.guardianIdentifierInfo;
            const approvedList = info.approvedList;
            const type: AddManagerType = guardianIdentifierInfo?.isLoginGuardian ? 'recovery' : 'register';
            const params = {
              pin,
              type,
              chainId: guardianIdentifierInfo.chainId,
              accountType: guardianIdentifierInfo.accountType,
              guardianIdentifier: guardianIdentifierInfo?.identifier,
              guardianApprovedList: approvedList,
            };
            console.log(params, 'didWallet==createWallet');
            didWallet = await createWallet(params);
          }

          if (didWallet) {
            await onFinishRef.current?.(didWallet);
            setOpen(false);
            // TODO
            changeLifeCycle('Login', null);
            // setLifeCycle('Login');
            clearStorage();
            return;
          }
          return;
        } catch (error) {
          const errorMessage = handleErrorMessage(error);
          console.log('loginDefaultByPin:errorMessage==', errorMessage);
          //
        }
        changeLifeCycle('SetPinAndAddManager', {
          guardianIdentifierInfo,
          approvedList,
        });
      },
      [approvedList, changeLifeCycle, clearStorage, createWallet, guardianIdentifierInfo, pin],
    );

    const onStep2OfSignUpFinish = useCallback(
      (res: TSignUpVerifier, value?: IGuardianIdentifierInfo) => {
        const identifier = value || guardianIdentifierInfo;
        if (!identifier) return console.error('No guardianIdentifier!');
        const list = [
          {
            type: identifier.accountType,
            identifier: identifier.identifier,
            verifierId: res.verifier.id,
            verificationDoc: res.verificationDoc,
            signature: res.signature,
          },
        ];
        setApprovedList(list);

        identifier &&
          loginDefaultByPin({
            guardianIdentifierInfo: identifier,
            approvedList: list,
          });
      },
      [guardianIdentifierInfo, loginDefaultByPin],
    );

    const onSignUp = useCallback(
      async (value: IGuardianIdentifierInfo) => {
        try {
          setLoading(true, 'Assigning a verifier on the blockchain');
          await sleep(2000);
          const verifier = await getRecommendationVerifier(chainId);
          setLoading(false);
          const { accountType, authenticationInfo, identifier } = value;
          if (SocialLoginList.includes(accountType)) {
            setLoading(true);
            const result = await verifySocialToken({
              accountType,
              token: authenticationInfo?.authToken,
              guardianIdentifier: identifier,
              verifier,
              chainId,
              networkType,
              operationType: OperationTypeEnum.register,
            });
            setLoading(false);

            onStep2OfSignUpFinish(
              {
                verifier,
                verificationDoc: result.verificationDoc,
                signature: result.signature,
              },
              value,
            );
          } else {
            const verifyCodeInfo = await sendCodeConfirm({
              verifier,
              accountType,
              identifierInfo: value,
            });
            if (!verifyCodeInfo) return;
            setVerifierCodeInfo(verifyCodeInfo);
            changeLifeCycle('SignUpCodeVerify', {
              guardianIdentifierInfo: value,
              verifyCodeInfo,
            });
          }
        } catch (error) {
          setLoading(false);
          const errorMsg = handleErrorMessage(error);
          errorTip(
            {
              errorFields: 'Check sign up',
              error: errorMsg,
            },
            isErrorTip,
            onError,
          );
        }
      },
      [
        chainId,
        changeLifeCycle,
        getRecommendationVerifier,
        isErrorTip,
        networkType,
        onError,
        onStep2OfSignUpFinish,
        sendCodeConfirm,
        verifySocialToken,
      ],
    );

    const onSignInHandler = useSignInHandler({ isErrorTip, onError });

    const onSignIn = useCallback(
      async (guardianIdentifierInfo: IGuardianIdentifierInfo) => {
        try {
          console.log(guardianIdentifierInfo, 'onSignIn==guardianIdentifierInfo');
          const signResult = await onSignInHandler(guardianIdentifierInfo);
          if (!signResult) return;
          defaultLiftCyclePropsRef.current = {
            guardianIdentifierInfo,
            guardianList: signResult.value.guardianList,
          };
          defaultLifeCycleRef.current = undefined;

          const approvedList = signResult.value?.approvedList;
          approvedList && setApprovedList(approvedList);
          if (signResult.nextStep === NextStepType.SetPinAndAddManager) {
            await loginDefaultByPin({
              guardianIdentifierInfo,
              approvedList: approvedList || [],
            });
            return;
          }
          console.log(signResult, 'signResult===');
          setLifeCycle(signResult.nextStep);
        } catch (error) {
          console.log(error, 'error==onSignIn==');
          errorTip(
            {
              errorFields: 'SignIn',
              error: handleErrorMessage(error),
            },
            isErrorTip,
            onError,
          );
        } finally {
          setLoading(false);
        }
      },
      [isErrorTip, loginDefaultByPin, onError, onSignInHandler],
    );

    const onSignInFinished: OnSignInFinishedFun = useCallback(
      async (result) => {
        console.log(result, 'result==onSignInFinished');
        const { type, value } = result.result;
        if (result.isFinished) {
          // Sign in by scan
          await onFinishRef.current?.(value as DIDWalletInfo);
        } else {
          const identifier = value as IGuardianIdentifierInfo;
          setGuardianIdentifierInfo(identifier);
          if (type === 'SignUp') {
            await onSignUp(identifier);
          } else {
            await onSignIn(identifier);
          }
        }
      },
      [onSignIn, onSignUp],
    );

    const onStep2Cancel = useCallback(
      (type: 'Login' | 'SignUp') => {
        changeLifeCycle(type, null);
        setApprovedList(undefined);
      },
      [changeLifeCycle],
    );

    const onStep3Cancel = useCallback(
      (v?: AddManagerType) => {
        if (v === 'register') {
          changeLifeCycle('SignUp', null);
          setApprovedList(undefined);
        } else if (v === 'recovery') {
          changeLifeCycle('GuardianApproval', { guardianIdentifierInfo });
        } else {
          changeLifeCycle('Login', null);
        }
      },
      [changeLifeCycle, guardianIdentifierInfo],
    );

    const onLoginFinishWithoutPin: LoginFinishWithoutPin = useCallback(
      (wallet) => {
        setWalletWithoutPin(wallet);
        loginDefaultByPin(null, wallet);
      },
      [loginDefaultByPin],
    );

    const onSignInStepChange = useCallback(
      (v: SignInLifeCycleType) => {
        console.log(v, 'onSignInStepChange===');
        changeLifeCycle(v, null);
      },
      [changeLifeCycle],
    );

    const onOriginChainIdChange = useCallback((v?: ChainId) => {
      v && setOriginChainId(v);
      v && onChainIdChangeRef?.current?.(v);
    }, []);

    const onStep3Finish = useCallback(
      async (v: DIDWalletInfo | string) => {
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
          await onFinishRef.current?.({ ...walletWithoutPin, pin: v });
        } else {
          await onFinishRef.current?.(v);
        }
        setOpen(false);
        // TODO
        changeLifeCycle('Login', null);
        // setLifeCycle('Login');
        clearStorage();
      },
      [changeLifeCycle, clearStorage, isErrorTip, onError, walletWithoutPin],
    );

    const onModalCancel = useCallback(() => {
      onCancel?.();
      clearStorage();
      setOpen(false);
      changeLifeCycle('Login', null);
    }, [changeLifeCycle, clearStorage, onCancel]);

    const onStep2LoginFinish = useCallback(
      async (list: GuardiansApproved[]) => {
        setApprovedList(list);
        if (guardianIdentifierInfo)
          await loginDefaultByPin({
            guardianIdentifierInfo,
            approvedList: list,
          });
      },
      [guardianIdentifierInfo, loginDefaultByPin],
    );

    const onGuardianListChange = useCallback(
      (
        guardianList: UserGuardianStatus[],
        lifeCycle: 'Step2OfSkipGuardianApprove' | 'GuardianApproval' = 'GuardianApproval',
      ) => {
        console.log('onGuardianListChange', guardianList);
        changeLifeCycle(lifeCycle, {
          guardianIdentifierInfo,
          guardianList,
        });
      },
      [changeLifeCycle, guardianIdentifierInfo],
    );

    const renderStep2OfLogin = useCallback(
      (_lifeCycle: LifeCycleType) => {
        if (!guardianIdentifierInfo)
          return <div className="portkey-ui-text-center">Missing `guardianIdentifierInfo`</div>;
        if (_lifeCycle === 'Step2OfSkipGuardianApprove')
          return (
            <Step2OfSkipGuardianApprove
              networkType={networkType}
              guardianList={defaultLiftCyclePropsRef.current?.guardianList}
              guardianIdentifierInfo={guardianIdentifierInfo}
              isErrorTip={isErrorTip}
              onError={onErrorRef?.current}
              onFinish={onStep2LoginFinish}
              onCancel={() => onStep2Cancel('Login')}
              onGuardianListChange={(v) => onGuardianListChange(v, 'Step2OfSkipGuardianApprove')}
            />
          );
        return (
          <Step2OfLogin
            guardianList={defaultLiftCyclePropsRef.current?.guardianList}
            approvedList={approvedList}
            networkType={networkType}
            chainType={chainType}
            chainId={chainId}
            guardianIdentifierInfo={guardianIdentifierInfo}
            isErrorTip={isErrorTip}
            onError={onErrorRef?.current}
            onFinish={onStep2LoginFinish}
            onCancel={() => onStep2Cancel('Login')}
            onGuardianListChange={(v) => onGuardianListChange(v, 'GuardianApproval')}
          />
        );
      },
      [
        approvedList,
        chainId,
        chainType,
        guardianIdentifierInfo,
        isErrorTip,
        onGuardianListChange,
        onStep2Cancel,
        onStep2LoginFinish,
        networkType,
      ],
    );

    const loginConfig = ConfigProvider.getConfig('loginConfig') as ILoginConfig;

    const loginMethodsOrder = useMemo(
      () => (loginConfig?.loginMethodsOrder as AccountType[]) || TotalAccountTypeList,
      [loginConfig?.loginMethodsOrder],
    );
    const recommendIndexes = useMemo(
      () => (loginConfig?.recommendIndexes as number[]) || [0, 1],
      [loginConfig?.recommendIndexes],
    );

    const extra = useMemo(
      () => (extraElement ? [extraElement, ...(extraElementList ?? [])] : extraElementList),
      [extraElement, extraElementList],
    );

    const mainContent = useCallback(() => {
      if (LifeCycleMap['SignIn'].includes(lifeCycle))
        return (
          <Step1
            type={lifeCycle as any}
            isShowScan={isShowScan}
            size={uiType === 'Modal' ? 'S' : undefined}
            design={design}
            defaultChainId={defaultChainId}
            isErrorTip={isErrorTip}
            onError={onErrorRef?.current}
            phoneCountry={phoneCountry}
            extraElementList={extra}
            validateEmail={validateEmail}
            validatePhone={validatePhone}
            onSignUpHandler={onSignUpHandlerRef.current}
            onSignInFinished={onSignInFinished}
            onStepChange={onSignInStepChange}
            onChainIdChange={onOriginChainIdChange}
            onLoginFinishWithoutPin={onLoginFinishWithoutPin}
            termsOfService={termsOfService}
            privacyPolicy={privacyPolicy}
            loginMethodsOrder={loginMethodsOrder}
            recommendIndexes={recommendIndexes}
          />
        );
      if (LifeCycleMap['Step2OfSignUp'].includes(lifeCycle)) {
        if (!guardianIdentifierInfo)
          return <div className="portkey-ui-text-center">Missing `guardianIdentifierInfo`</div>;
        return (
          <Step2OfSignUp
            verifierCodeInfo={verifierCodeInfo}
            guardianIdentifierInfo={guardianIdentifierInfo}
            isErrorTip={isErrorTip}
            onStepChange={changeLifeCycle}
            onError={onErrorRef?.current}
            onFinish={onStep2OfSignUpFinish}
            onCancel={() => onStep2Cancel('SignUp')}
          />
        );
      }
      if (LifeCycleMap['Step2OfLogin'].includes(lifeCycle)) {
        return renderStep2OfLogin(lifeCycle);
      }

      if (LifeCycleMap['Step3'].includes(lifeCycle))
        return (
          <Step3
            keyboard={keyboard}
            guardianIdentifierInfo={guardianIdentifierInfo}
            onlyGetPin={Boolean(walletWithoutPin)}
            guardianApprovedList={approvedList || []}
            isErrorTip={isErrorTip}
            onError={onErrorRef?.current}
            onFinish={onStep3Finish}
            onCancel={onStep3Cancel}
            onCreatePending={onCreatePending}
          />
        );
      return 'Please confirm whether the current lifeCycle is correct';
    }, [
      lifeCycle,
      isShowScan,
      uiType,
      design,
      defaultChainId,
      isErrorTip,
      phoneCountry,
      extra,
      validateEmail,
      validatePhone,
      onSignInFinished,
      onSignInStepChange,
      onOriginChainIdChange,
      onLoginFinishWithoutPin,
      termsOfService,
      privacyPolicy,
      loginMethodsOrder,
      recommendIndexes,
      keyboard,
      guardianIdentifierInfo,
      walletWithoutPin,
      approvedList,
      onStep3Finish,
      onStep3Cancel,
      onCreatePending,
      verifierCodeInfo,
      changeLifeCycle,
      onStep2OfSignUpFinish,
      onStep2Cancel,
      renderStep2OfLogin,
    ]);

    return (
      <PortkeyStyleProvider>
        {uiType === 'Full' ? (
          <Container getContainer={getContainer}>
            <div className={clsx('portkey-sign-full-wrapper', className)}>{mainContent()}</div>
          </Container>
        ) : (
          <CommonBaseModal
            destroyOnClose
            className={clsx('portkey-ui-sign-modal', `portkey-ui-sign-modal-${design}`, className)}
            maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            open={open}
            getContainer={getContainer ? getContainer : `#${PORTKEY_ROOT_ID}`}
            onClose={onModalCancel}>
            {mainContent()}
          </CommonBaseModal>
        )}
      </PortkeyStyleProvider>
    );
  },
);

export default SignIn;
