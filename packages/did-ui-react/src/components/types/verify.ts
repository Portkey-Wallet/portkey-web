import { VerifierItem } from '@portkey/did';
import { AccountType } from '@portkey/services';
import { OnErrorFunc, PartialOption } from '../../types';
import { ReactNode } from 'react';

export interface IVerifyInfo {
  verificationDoc?: string;
  signature?: string;
}

export type IVerifier = {
  id: string;
  name: string;
  imageUrl: string;
};

export type TVerifierItem = PartialOption<VerifierItem, 'endPoints' | 'verifierAddresses'>;

export interface BaseCodeVerifyProps {
  verifier: TVerifierItem;
  className?: string;
  tipExtra?: ReactNode;
  isCountdownNow?: boolean;
  isLoginGuardian?: boolean;
  accountType?: AccountType;
  guardianIdentifier: string;
  onError?: OnErrorFunc;
}
