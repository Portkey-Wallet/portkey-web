import { ChainId, ChainType } from '@portkey/types';
import { GuardianStep } from '../components/Guardian/index.component';
import { NetworkType } from './wallet';
import { UserGuardianStatus } from './guardian';

export type TOpenLoginGuardianLocationState = {
  networkType: NetworkType;
  originChainId: ChainId;
  chainType: ChainType;
  caHash: string;
  guardianStep: GuardianStep;
  isErrorTip?: boolean;
  currentGuardian?: UserGuardianStatus;
} & Record<string, any>;
