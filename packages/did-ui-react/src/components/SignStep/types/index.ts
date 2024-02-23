import { ModalProps } from 'antd';
import { OnErrorFunc, UserGuardianStatus, ValidatorHandler, VerifyStatus } from '../../../types';
import {
  CreatePendingInfo,
  CreateWalletType,
  DIDWalletInfo,
  IGuardianIdentifierInfo,
  TDesign,
  TVerifierItem,
} from '../../types';
import { ChainId } from '@portkey/types';
import { ReactNode } from 'react';
import { AccountType, GuardiansApproved } from '@portkey/services';
export type SIGN_IN_STEP = 'SignIn' | 'Step2OfSignUp' | 'Step2OfLogin' | 'Step3';

export type SignInLifeCycleType = CreateWalletType;

export type Step2SignUpLifeCycleType = 'SignUpCodeVerify';
export type Step2SignInLifeCycleType = 'GuardianApproval';

export type SetPinAndAddManagerCycleType = 'SetPinAndAddManager';
export type Step2OfSkipGuardianApprove = 'Step2OfSkipGuardianApprove';

export type LifeCycleType =
  | SignInLifeCycleType
  | Step2SignUpLifeCycleType
  | Step2SignInLifeCycleType
  | Step2OfSkipGuardianApprove
  | SetPinAndAddManagerCycleType;

export type UI_TYPE = 'Modal' | 'Full';

export type TStep1LifeCycle = {
  [x in SignInLifeCycleType]?: undefined;
};

export type TVerifyCodeInfo = {
  verifier: TVerifierItem;
  verifierSessionId: string;
};

export type TStep2SignUpLifeCycle = {
  SignUpCodeVerify: {
    guardianIdentifierInfo: IGuardianIdentifierInfo;
    verifyCodeInfo: TVerifyCodeInfo;
  };
};

export type TStep2SignInLifeCycle = {
  // [x in Step2SignInLifeCycleType]
  GuardianApproval: {
    guardianIdentifierInfo: IGuardianIdentifierInfo;
    guardianList?: (Omit<UserGuardianStatus, 'status'> & { status?: `${VerifyStatus}` })[];
  };
};

export type TStep3LifeCycle = {
  [x in SetPinAndAddManagerCycleType]: {
    guardianIdentifierInfo: IGuardianIdentifierInfo;
    approvedList: GuardiansApproved[];
  };
};

export enum SignUpValue {
  cancelRegister,
  otherSeverRegisterButContinue,
  continue,
}

export type TSignUpContinueHandler = (identifierInfo: {
  identifier: string;
  accountType: AccountType;
  authToken?: string;
}) => Promise<SignUpValue>;

export interface SignInProps {
  defaultChainId?: ChainId;
  /**
   * You can configure the default pin
   */
  pin?: string;
  /** When on mobile, use the numeric keypad  */
  keyboard?: boolean;

  defaultLifeCycle?: Partial<TStep1LifeCycle | TStep2SignUpLifeCycle | TStep2SignInLifeCycle | TStep3LifeCycle>;
  isErrorTip?: boolean;

  // Login
  isShowScan?: boolean;
  /** @deprecated Please use `extraElementList` */
  extraElement?: ReactNode; // extra element
  extraElementList?: ReactNode[]; // extra element
  termsOfService?: ReactNode;
  privacyPolicy?: string;
  design?: TDesign;
  validateEmail?: ValidatorHandler;
  onChainIdChange?(chainId?: ChainId): void;
  /**
   * Fired when it is detected that the user is not registered.
   * You can control whether to continue the subsequent process to complete user registration by returning a Boolean value.
   */
  onSignUp?: TSignUpContinueHandler;
  onFinish?(didWallet: DIDWalletInfo): void;
  onCreatePending?(createPendingInfo: CreatePendingInfo): void;

  onLifeCycleChange?<T = any>(liftCycle: LifeCycleType, nextLifeCycleProps: T): void;
  onLifeCycleChange?(nextLifeCycle: SignInLifeCycleType, nextLifeCycleProps: undefined | null): void;
  onLifeCycleChange?(
    nextLifeCycle: 'SignUpCodeVerify',
    nextLifeCycleProps: TStep2SignUpLifeCycle['SignUpCodeVerify'],
  ): void;
  onLifeCycleChange?(
    nextLifeCycle: 'GuardianApproval',
    nextLifeCycleProps: TStep2SignInLifeCycle['GuardianApproval'],
  ): void;
  onLifeCycleChange?(
    nextLifeCycle: 'SetPinAndAddManager',
    nextLifeCycleProps: TStep3LifeCycle['SetPinAndAddManager'],
  ): void;

  // UI config
  uiType?: UI_TYPE;

  // Modal config
  className?: string;
  getContainer?: ModalProps['getContainer'];
  onCancel?: () => void;
  onError?: OnErrorFunc;
}
