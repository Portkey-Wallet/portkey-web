import { ModalProps } from 'antd';
import { OnErrorFunc, ValidatorHandler } from '../../../types';
import { CreatePendingInfo, CreateWalletType, DIDWalletInfo, IPhoneCountry } from '../../types';
import { ChainId } from '@portkey/types';
import { ReactNode } from 'react';
export type SIGN_IN_STEP = 'SignIn' | 'Step2OfSignUp' | 'Step2OfLogin' | 'Step3';

export type SignInLifeCycleType = CreateWalletType;

export type Step2SignUpLifeCycleType = 'VerifierSelect' | 'CodeVerify';
export type Step2SignInLifeCycleType = 'GuardianApproval';

export type SetPinAndAddManagerCycleType = 'SetPinAndAddManager';

export type LifeCycleType =
  | SignInLifeCycleType
  | Step2SignUpLifeCycleType
  | Step2SignInLifeCycleType
  | SetPinAndAddManagerCycleType;

export type UI_TYPE = 'Modal' | 'Full';
export type TDesign = 'SocialDesign' | 'CryptoDesign';

export interface SignInProps {
  defaultChainId?: ChainId;

  sandboxId?: string;
  isErrorTip?: boolean;

  // Login
  isShowScan?: boolean;
  phoneCountry?: IPhoneCountry;
  extraElement?: ReactNode; // extra element
  termsOfService?: ReactNode;
  design?: TDesign;
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
