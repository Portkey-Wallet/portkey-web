'use client';
/**
 * @remarks
 *
 * First you have to configure networkList using ConfigProvider.setGlobalConfig
 */
import CommonBaseModal from '../CommonBaseModal';
import { useState, useCallback, useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Step1, { OnSignInFinishedFun } from '../SignStep/components/Step1';
import Step2OfSignUp from '../SignStep/components/Step2OfSignUp';
import Step2OfLogin from '../SignStep/components/Step2OfLogin';
import Step3 from '../SignStep/components/Step3';
import { useEffectOnce } from 'react-use';
import type {
  IVerifyInfo,
  DIDWalletInfo,
  IGuardianIdentifierInfo,
  IPhoneCountry,
  AddManagerType,
  LoginFinishWithoutPin,
  TVerifierItem,
} from '../types';
import type { ChainId } from '@portkey/types';
import { OperationTypeEnum, GuardiansApproved } from '@portkey/services';
import { LifeCycleType, SignInLifeCycleType, SIGN_IN_STEP, SignInProps, TVerifyCodeInfo } from '../SignStep/types';
import clsx from 'clsx';
import { did, errorTip, handleErrorMessage, setLoading } from '../../utils';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import { UserGuardianStatus } from '../../types';
import Container from '../Container';
import { usePortkey } from '../context';
import useVerifier from '../../hooks/useVerifier';
import { sleep } from '@portkey/utils';
import { modalMethod } from '../../utils/modalMethod';
import './index.less';

export const LifeCycleMap: { [x in SIGN_IN_STEP]: LifeCycleType[] } = {
  Step3: ['SetPinAndAddManager'],
  Step2OfLogin: ['GuardianApproval'],
  Step2OfSignUp: ['SignUpCodeVerify'],
  SignIn: ['SignUp', 'Login', 'LoginByScan'],
};

type TSignUpVerifier = { verifier: TVerifierItem } & IVerifyInfo;

const SignIn = forwardRef(
  (
    {
      defaultChainId = 'AELF',
      isErrorTip = true,
      // If you set isShowScan to true, make sure you configure `network`
      isShowScan,
      defaultLifeCycle: defaultLifeCycleInfo,
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
      onCreatePending,
      onCancel,
      onFinish,
      onError,
    }: SignInProps,
    ref,
  ) => {
    const [guardianIdentifierInfo, setGuardianIdentifierInfo] = useState<IGuardianIdentifierInfo>();
    const [verifierCodeInfo, setVerifierCodeInfo] = useState<TVerifyCodeInfo>();
    const onErrorRef = useRef<SignInProps['onError']>(onError);
    const onFinishRef = useRef<SignInProps['onFinish']>(onFinish);
    const onChainIdChangeRef = useRef<SignInProps['onChainIdChange']>(onChainIdChange);
    const onLifeCycleChangeRef = useRef<SignInProps['onLifeCycleChange']>(onLifeCycleChange);
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
    });

    const [{ chainType }] = usePortkey();
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

    const { getRecommendationVerifier, verifySocialToken, sendVerifyCode } = useVerifier();

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
        changeLifeCycle('SetPinAndAddManager', {
          guardianIdentifierInfo: identifier,
          approvedList: list,
        });
      },
      [changeLifeCycle, guardianIdentifierInfo],
    );

    const onSignUp = useCallback(
      async (value: IGuardianIdentifierInfo) => {
        try {
          setLoading(true, 'Assigning a verifier on-chain…');
          await sleep(2000);
          const verifier = await getRecommendationVerifier(chainId);
          setLoading(false);
          const { accountType, authenticationInfo, identifier } = value;
          if (accountType === 'Apple' || accountType === 'Google') {
            setLoading(true);
            const result = await verifySocialToken({
              accountType,
              token: authenticationInfo?.appleIdToken || authenticationInfo?.googleAccessToken,
              guardianIdentifier: identifier,
              verifier,
              chainId,
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
            const isOk = await modalMethod({
              wrapClassName: 'verify-confirm-modal',
              type: 'confirm',
              content: (
                <p className="modal-content">
                  {`${verifier.name ?? ''} will send a verification code to `}
                  <span className="bold">{identifier}</span>
                  {` to verify your ${accountType} address.`}
                </p>
              ),
            });
            if (isOk) {
              const result = await sendVerifyCode({
                accountType,
                guardianIdentifier: identifier,
                verifier,
                chainId,
                operationType: OperationTypeEnum.register,
              });

              if (!result?.verifierSessionId) return;
              const verifyCodeInfo = {
                verifier,
                verifierSessionId: result.verifierSessionId,
              };
              setVerifierCodeInfo(verifyCodeInfo);
              changeLifeCycle('SignUpCodeVerify', {
                guardianIdentifierInfo: value,
                verifyCodeInfo,
              });
            } else {
              // Cancel
            }
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
        onError,
        onStep2OfSignUpFinish,
        sendVerifyCode,
        verifySocialToken,
      ],
    );

    const onSignInFinished: OnSignInFinishedFun = useCallback(
      async (result) => {
        const { type, value } = result.result;
        if (result.isFinished) {
          // Sign in by scan
          onFinishRef?.current?.(value as DIDWalletInfo);
        } else {
          setGuardianIdentifierInfo(value as IGuardianIdentifierInfo);
          if (type === 'SignUp') {
            await onSignUp(value as IGuardianIdentifierInfo);
          } else {
            changeLifeCycle('GuardianApproval', { guardianIdentifierInfo: value });
            setApprovedList(undefined);
          }
        }
      },
      [changeLifeCycle, onSignUp],
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

    const clearStorage = useCallback(() => {
      setWalletWithoutPin(undefined);
      setGuardianIdentifierInfo(undefined);
      setOriginChainId(undefined);
      setApprovedList(undefined);
    }, []);

    const onLoginFinishWithoutPin: LoginFinishWithoutPin = useCallback(
      (wallet) => {
        setWalletWithoutPin(wallet);
        changeLifeCycle('SetPinAndAddManager', null);
      },
      [changeLifeCycle],
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

    const onStep2LoginFinish = useCallback(
      (list: GuardiansApproved[]) => {
        setApprovedList(list);
        changeLifeCycle('SetPinAndAddManager', {
          guardianIdentifierInfo,
          approvedList: list,
        });
      },
      [changeLifeCycle, guardianIdentifierInfo],
    );

    const onGuardianListChange = useCallback(
      (guardianList: UserGuardianStatus[]) => {
        console.log('onGuardianListChange', guardianList);
        changeLifeCycle('GuardianApproval', {
          guardianIdentifierInfo,
          guardianList,
        });
      },
      [changeLifeCycle, guardianIdentifierInfo],
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
            extraElement={extraElement}
            validateEmail={validateEmail}
            validatePhone={validatePhone}
            onSignInFinished={onSignInFinished}
            onStepChange={onSignInStepChange}
            onChainIdChange={onOriginChainIdChange}
            onLoginFinishWithoutPin={onLoginFinishWithoutPin}
            termsOfService={termsOfService}
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
        if (!guardianIdentifierInfo)
          return <div className="portkey-ui-text-center">Missing `guardianIdentifierInfo`</div>;

        return (
          <Step2OfLogin
            guardianList={defaultLiftCyclePropsRef.current?.guardianList}
            approvedList={approvedList}
            chainType={chainType}
            chainId={chainId}
            guardianIdentifierInfo={guardianIdentifierInfo}
            isErrorTip={isErrorTip}
            onError={onErrorRef?.current}
            onFinish={onStep2LoginFinish}
            onCancel={() => onStep2Cancel('Login')}
            onGuardianListChange={onGuardianListChange}
          />
        );
      }
      if (LifeCycleMap['Step3'].includes(lifeCycle))
        return (
          <Step3
            guardianIdentifierInfo={guardianIdentifierInfo}
            onlyGetPin={Boolean(walletWithoutPin)}
            type={guardianIdentifierInfo?.isLoginGuardian ? 'recovery' : 'register'}
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
      extraElement,
      validateEmail,
      validatePhone,
      onSignInFinished,
      onSignInStepChange,
      onOriginChainIdChange,
      onLoginFinishWithoutPin,
      termsOfService,
      guardianIdentifierInfo,
      walletWithoutPin,
      approvedList,
      onStep3Finish,
      onStep3Cancel,
      onCreatePending,
      chainType,
      verifierCodeInfo,
      changeLifeCycle,
      onStep2OfSignUpFinish,
      onStep2Cancel,
      chainId,
      onStep2LoginFinish,
      onGuardianListChange,
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
            className={className}
            maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            open={open}
            getContainer={getContainer ? getContainer : '#portkey-ui-root'}
            onCancel={onModalCancel}>
            {mainContent()}
          </CommonBaseModal>
        )}
      </PortkeyStyleProvider>
    );
  },
);

export default SignIn;
