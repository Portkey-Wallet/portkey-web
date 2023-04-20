import { CreateWalletType } from '../../types';
export type SIGN_IN_STEP = 'SignIn' | 'Step2WithSignUp' | 'Step2WithSignIn' | 'Step3';

export type SignInLifeCycleType = CreateWalletType;

export type Step2SignUpLifeCycleType = 'VerifierSelect' | 'CodeVerify';
export type Step2SignInLifeCycleType = 'GuardianApproval';

export type SetPinAndAddManagerCycleType = 'SetPinAndAddManager';

export type LifeCycleType =
  | SignInLifeCycleType
  | Step2SignUpLifeCycleType
  | Step2SignInLifeCycleType
  | SetPinAndAddManagerCycleType;
