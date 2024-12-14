import CryptoDesign, { CryptoDesignProps } from '../../../CryptoDesign/index.component';
import { useCallback, useState, memo, useRef, useEffect } from 'react';
import type { DIDWalletInfo, IGuardianIdentifierInfo, TDesign, TSize } from '../../../types';
import { Design } from '../../../types';
import { SignUpValue, SignInLifeCycleType, TSignUpContinueHandler } from '../../../SignStep/types';
import { useUpdateEffect } from 'react-use';
import LoginModal from '../../../LoginModal';
import SocialDesign from '../../../SocialDesign/index.component';
import Web2Design from '../../../Web2Design/index.component';
import { ISocialLogin } from '../../../../types';
import { setLoading } from '../../../../utils';

export type OnSignInFinishedFun = (values: {
  isFinished: boolean;
  result: {
    type?: SignInLifeCycleType;
    value: IGuardianIdentifierInfo | DIDWalletInfo;
  };
}) => void;

interface Step1Props extends CryptoDesignProps {
  size?: TSize;
  design?: TDesign;
  onSignInFinished: OnSignInFinishedFun;
  onSignUpHandler?: TSignUpContinueHandler;
  onStepChange?: (v: SignInLifeCycleType) => void;
}

function Step1({
  size,
  design,
  onStepChange,
  onSignInFinished,
  onSignUpHandler,
  type,
  phoneCountry,
  loginMethodsOrder,
  isErrorTip,
  onError,
  ...props
}: Step1Props) {
  const [createType, setCreateType] = useState<SignInLifeCycleType>(type || 'Login');
  const [open, setOpen] = useState<boolean>();
  const signInSuccessRef = useRef<IGuardianIdentifierInfo>();
  const onSignUpHandlerRef = useRef<Step1Props['onSignUpHandler']>(onSignUpHandler);

  useEffect(() => {
    onSignUpHandlerRef.current = onSignUpHandler;
  });

  const onConfirm = useCallback(() => {
    if (!signInSuccessRef.current) return setOpen(false);
    const createType = signInSuccessRef.current.isLoginGuardian ? 'Login' : 'SignUp';
    setCreateType(createType);
    onSignInFinished?.({
      isFinished: false,
      result: {
        type: createType,
        value: signInSuccessRef.current,
      },
    });
    setOpen(false);
  }, [onSignInFinished]);

  const onSuccess = useCallback(
    async (value: IGuardianIdentifierInfo) => {
      signInSuccessRef.current = value;
      if (!value.isLoginGuardian) {
        setLoading(false);
        const isContinue = await onSignUpHandlerRef.current?.({
          identifier: value.identifier,
          accountType: value.accountType,
          authenticationInfo: {
            authToken: value.authenticationInfo?.authToken,
            idToken: value.authenticationInfo?.idToken,
            nonce: value.authenticationInfo?.nonce,
            timestamp: value.authenticationInfo?.timestamp,
          },
        });
        if (isContinue === SignUpValue.otherSeverRegisterButContinue) return onConfirm();
        if (isContinue === SignUpValue.cancelRegister) return;
        if (createType !== 'SignUp') return setOpen(true);
      }

      if (value.isLoginGuardian && createType !== 'Login') return setOpen(true);

      onSignInFinished?.({
        isFinished: false,
        result: {
          type: createType,
          value,
        },
      });
      setOpen(false);
    },
    [createType, onConfirm, onSignInFinished],
  );

  useUpdateEffect(() => {
    createType && onStepChange?.(createType);
    props.onSignTypeChange?.(createType);
  }, [createType]);

  // const [phoneCountry, setPhoneCountry] = useState<IPhoneCountry | undefined>(defaultPhoneCountry);

  // const getPhoneCountry = useCallback(async () => {
  //   try {
  //     const countryData = await did.services.getPhoneCountryCodeWithLocal();
  //     setPhoneCountry({ iso: countryData.locateData?.iso || '', countryList: countryData.data || [] });
  //   } catch (error) {
  //     errorTip(
  //       {
  //         errorFields: 'getPhoneCountry',
  //         error,
  //       },
  //       isErrorTip,
  //       onError,
  //     );
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // useEffect(() => {
  //   // Get phoneCountry by service, update phoneCountry
  //   getPhoneCountry();
  // }, [getPhoneCountry]);

  return (
    <>
      {design === Design.SocialDesign && (
        <SocialDesign
          {...props}
          type={type === 'LoginByScan' ? 'Scan' : null}
          phoneCountry={phoneCountry}
          loginMethodsOrder={loginMethodsOrder}
          isErrorTip={isErrorTip}
          onError={onError}
          onSuccess={onSuccess}
        />
      )}

      {design === Design.Web2Design && (
        <Web2Design
          {...props}
          size={size}
          type={type}
          loginMethodsOrder={loginMethodsOrder}
          phoneCountry={phoneCountry}
          isErrorTip={isErrorTip}
          onError={onError}
          onSignTypeChange={setCreateType}
          onSuccess={onSuccess}
        />
      )}

      {(!design || design === Design.CryptoDesign) && (
        <CryptoDesign
          {...props}
          type={type}
          phoneCountry={phoneCountry}
          loginMethodsOrder={loginMethodsOrder}
          isErrorTip={isErrorTip}
          onError={onError}
          onSignTypeChange={setCreateType}
          onSuccess={onSuccess}
        />
      )}

      <LoginModal open={open} type={createType} onCancel={() => setOpen(false)} onConfirm={onConfirm} />
    </>
  );
}
export default memo(Step1);
