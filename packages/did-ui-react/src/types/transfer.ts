import { ITransferLimitItem } from '@portkey/services';

export interface ITransferLimitItemWithRoute extends ITransferLimitItem {
  businessFrom?: {
    module: IBusinessFrom;
    extraConfig?: any;
  };
}

export type IBusinessFrom = 'ramp-sell' | 'send';
