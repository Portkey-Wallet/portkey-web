import { ModalProps } from 'antd';
import { OnErrorFunc, UserGuardianStatus, ValidatorHandler, VerifyStatus } from '../../../types';
import {
  CreatePendingInfo,
  CreateWalletType,
  DIDWalletInfo,
  IGuardianIdentifierInfo,
  IPhoneCountry,
  TDesign,
} from '../../types';
import { ChainId } from '@portkey/types';
import { ReactNode } from 'react';
import { GuardiansApproved } from '@portkey/services';
import { VerifierItem } from '@portkey/did';
export type SIGN_IN_STEP = 'SignIn' | 'Step2OfSignUp' | 'Step2OfLogin' | 'Step3';

export type SignInLifeCycleType = CreateWalletType;

export type Step2SignUpLifeCycleType = 'VerifierSelect' | 'SignUpCodeVerify';
export type Step2SignInLifeCycleType = 'GuardianApproval';

export type SetPinAndAddManagerCycleType = 'SetPinAndAddManager';

export type LifeCycleType =
  | SignInLifeCycleType
  | Step2SignUpLifeCycleType
  | Step2SignInLifeCycleType
  | SetPinAndAddManagerCycleType;

export type UI_TYPE = 'Modal' | 'Full';

export type TStep1LifeCycle = {
  [x in SignInLifeCycleType]?: undefined;
};

type VerifierSelectConfirmResult = {
  verifier: VerifierItem;
  // accountType === 'Email' || accountType === 'Phone' is required;
  verifierSessionId: string;
};

export type TStep2SignUpLifeCycle = {
  // [x in Step2SignUpLifeCycleType]?:
  VerifierSelect: {
    guardianIdentifierInfo: IGuardianIdentifierInfo;
  };
  SignUpCodeVerify: {
    guardianIdentifierInfo: IGuardianIdentifierInfo;
    verifierSelectResult: VerifierSelectConfirmResult;
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

export interface SignInProps {
  defaultChainId?: ChainId;

  defaultLifeCycle?: Partial<TStep1LifeCycle | TStep2SignUpLifeCycle | TStep2SignInLifeCycle | TStep3LifeCycle>;
  isErrorTip?: boolean;

  // Login
  isShowScan?: boolean;
  phoneCountry?: IPhoneCountry;
  extraElement?: ReactNode; // extra element
  termsOfService?: ReactNode;
  design?: TDesign;
  validateEmail?: ValidatorHandler;
  validatePhone?: ValidatorHandler;
  onChainIdChange?(chainId?: ChainId): void;
  onFinish?(didWallet: DIDWalletInfo): void;
  onCreatePending?(createPendingInfo: CreatePendingInfo): void;

  onLifeCycleChange?<T = any>(liftCycle: LifeCycleType, nextLifeCycleProps: T): void;
  onLifeCycleChange?(nextLifeCycle: SignInLifeCycleType, nextLifeCycleProps: undefined | null): void;
  onLifeCycleChange?(
    nextLifeCycle: 'VerifierSelect',
    nextLifeCycleProps: TStep2SignUpLifeCycle['VerifierSelect'],
  ): void;
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
