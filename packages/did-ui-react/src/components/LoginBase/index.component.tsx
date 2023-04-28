import { useState, useRef, useEffect, useMemo } from 'react';
import { ISocialLoginConfig, OnErrorFunc, SocialLoginFinishHandler, ValidatorHandler } from '../../types';
import ConfigProvider from '../config-provider';
import InputLogin from '../InputLogin';
import SocialLogin from '../SocialLogin';
import { CreateWalletType, GuardianInputInfo, LoginFinishWithoutPin } from '../types';
import { IPhoneCountry } from '../types';
import './index.less';

export interface LoginBaseProps {
  isShowScan?: boolean;
  termsOfServiceUrl?: string;
  phoneCountry?: IPhoneCountry;
  socialLogin?: ISocialLoginConfig;
  isErrorTip?: boolean;
  networkType?: string;
  onLoginByPortkey?: LoginFinishWithoutPin;
  onInputFinish?: (data: GuardianInputInfo) => void;
  validateEmail?: ValidatorHandler;
  validatePhone?: ValidatorHandler;
  onSocialLoginFinish?: SocialLoginFinishHandler;
  onStep?: (value: CreateWalletType) => void;
  onNetworkChange?: (network: string) => void;
  onError?: OnErrorFunc;
}

enum STEP {
  socialLogin,
  inputLogin,
}
export default function LoginCard({
  isShowScan,
  phoneCountry,
  isErrorTip,
  socialLogin,
  networkType,
  termsOfServiceUrl,
  onStep,
  onError,
  onInputFinish,
  validateEmail,
  validatePhone,
  onLoginByPortkey,
  onSocialLoginFinish,
  onNetworkChange,
}: LoginBaseProps) {
  // const { network, networkList } = useNetworkList();
  const onNetworkChangeRef = useRef<LoginBaseProps['onNetworkChange']>(onNetworkChange);
  useEffect(() => {
    onNetworkChangeRef.current = onNetworkChange;
  });
  const _socialLogin = useMemo(() => socialLogin || ConfigProvider.getSocialLoginConfig(), [socialLogin]);

  // const selectItems = useMemo(
  //   () =>
  //     networkList?.map((item) => ({
  //       value: item.networkType,
  //       icon: item?.networkIconUrl ? <img src={item?.networkIconUrl} /> : <CustomSvg type="Aelf" />,
  //       label: item.name,
  //       disabled: !item.isActive,
  //     })),
  //   [networkList],
  // );

  // const networkChange = useCallback((value: string) => {
  //   ConfigProvider.setNetwork(value);
  //   onNetworkChangeRef?.current?.(value);
  // }, []);

  const [step, setStep] = useState<STEP>(STEP.socialLogin);

  return (
    <div className="flex-column login-ui-card">
      {step === STEP.inputLogin ? (
        <InputLogin
          type="Login"
          phoneCountry={phoneCountry}
          validateEmail={validateEmail}
          validatePhone={validatePhone}
          onFinish={onInputFinish}
          onBack={() => setStep(STEP.socialLogin)}
        />
      ) : (
        <SocialLogin
          className="flex-1"
          type="Login"
          networkType={networkType}
          socialLogin={_socialLogin}
          isShowScan={isShowScan}
          isErrorTip={isErrorTip}
          onFinish={onSocialLoginFinish}
          switchType={onStep}
          switchGuardinType={() => setStep(STEP.inputLogin)}
          termsOfServiceUrl={termsOfServiceUrl}
          onLoginByPortkey={onLoginByPortkey}
          onError={onError}
        />
      )}
      {/* TODO feature The new version iteration supports main test network switching */}
      {/* {Boolean(selectItems?.length) && (
        <div className="network-list-wrapper">
          <CommonSelect
            className="network-list-select"
            placement="topLeft"
            value={network}
            items={selectItems}
            onChange={networkChange}
            showArrow={false}
            getPopupContainer={(triggerNode) => triggerNode.parentElement}
          />
        </div>
      )} */}
    </div>
  );
}
