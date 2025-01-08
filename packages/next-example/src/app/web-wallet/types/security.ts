import { IAccelerateGuardian } from '@portkey/services';

export type CheckSecurityResult = {
  isTransferSafe: boolean;
  isSynchronizing: boolean;
  isOriginChainSafe: boolean;
  accelerateGuardians: IAccelerateGuardian[];
};
