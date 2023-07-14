import { VerifierItem } from '@portkey/did';
import { AccountType } from '@portkey/services';
import { OnErrorFunc } from '../../types';

export interface IVerifyInfo {
  verificationDoc: string;
  signature: string;
}

export interface BaseCodeVerifyProps {
  verifier: VerifierItem;
  className?: string;
  isCountdownNow?: boolean;
  isLoginGuardian?: boolean;
  accountType?: AccountType;
  guardianIdentifier: string;
  onError?: OnErrorFunc;
}
