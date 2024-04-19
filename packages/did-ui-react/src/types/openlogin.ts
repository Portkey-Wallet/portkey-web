import { ChainId, ChainType } from '@portkey/types';
import { GuardiansApproved, OperationTypeEnum } from '@portkey/services';
import { GuardianStep } from '../components/Guardian/index.component';
import { NetworkType } from './wallet';
import { GuardianApprovedItem, UserGuardianStatus } from './guardian';
import { ITelegramInfo, TCustomNetworkType } from '.';
import { OpenloginParamConfig, PopupResponse } from '../utils/openlogin/types';

export type TOpenLoginGuardianLocationState = {
  networkType: NetworkType;
  originChainId: ChainId;
  chainType: ChainType;
  caHash: string;
  guardianStep: GuardianStep;
  isErrorTip?: boolean;
  currentGuardian?: UserGuardianStatus;
  telegramInfo: ITelegramInfo;
} & Record<string, any>;

export interface IOpenLoginGuardianResponse {
  preGuardian?: UserGuardianStatus;
  currentGuardian: UserGuardianStatus;
  approvalInfo: GuardiansApproved[];
}

export type TOpenLoginGuardianApprovalLocationState = {
  networkType: NetworkType;
  originChainId: ChainId;
  targetChainId: ChainId;
  caHash?: string;
  identifier?: string;
  operationType: OperationTypeEnum;
  isErrorTip?: boolean;
} & Record<string, any>;

export interface IOpenLoginGuardianApprovalResponse {
  approvalInfo: GuardiansApproved[];
  formatGuardiansApproved: GuardianApprovedItem[];
}

export type TOpenLoginBridgeURL = {
  [key in TCustomNetworkType]: {
    [key in NetworkType]: string;
  };
};

export type TOpenLoginQueryParams =
  | OpenloginParamConfig
  | TOpenLoginGuardianLocationState
  | TOpenLoginGuardianApprovalLocationState;

export type TOpenLoginHandlerResponse = PopupResponse | IOpenLoginGuardianResponse | IOpenLoginGuardianApprovalResponse;

export interface IOpenloginHandlerResult {
  data?: TOpenLoginHandlerResponse;
  methodName?: string;
}
