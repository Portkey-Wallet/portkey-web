import { ChainId, ChainType } from '@portkey/types';
import { GuardiansApproved } from '@portkey/services';
import { GuardianStep } from '../components/Guardian/index.component';
import { NetworkType } from './wallet';
import { UserGuardianStatus } from './guardian';
import { TCustomNetworkType } from '.';

export type TOpenLoginGuardianLocationState = {
  networkType: NetworkType;
  originChainId: ChainId;
  chainType: ChainType;
  caHash: string;
  guardianStep: GuardianStep;
  isErrorTip?: boolean;
  currentGuardian?: UserGuardianStatus;
} & Record<string, any>;

export interface IOpenLoginGuardianResponse {
  preGuardian?: UserGuardianStatus;
  currentGuardian: UserGuardianStatus;
  approvalInfo: GuardiansApproved[];
}

export type TOpenLoginBridgeURL = {
  [key in TCustomNetworkType]: string;
};
