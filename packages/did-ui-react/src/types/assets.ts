import { IAssetItemType } from '@portkey/services';
import { ChainId } from '@portkey/types';
import svgList from '../assets/svgs';
import { SendExtraConfig } from '../components/Send/index.components';
import { BaseToken, NFTItemBaseExpand, TokenItemShowType } from '../components/types/assets';
import { AssetStep } from '../constants/assets';
import { TRampInitState } from './ramp';
import { ITransferLimitItemWithRoute } from './transfer';

export enum AddressCheckError {
  invalidAddress = 'Invalid Address',
  recipientAddressIsInvalid = 'Recipient address is invalid',
  equalIsValid = 'The sender and recipient address are identical',
}

export type SvgType = keyof typeof svgList;

export type TAssetPageState = {
  assetStep: AssetStep;
  preStep?: AssetStep;
  accelerateChainId?: ChainId;
  selectToken?: BaseToken;
  sendToken?: IAssetItemType;
  sendExtraConfig?: SendExtraConfig;
  rampExtraConfig?: TRampInitState;
  NFTDetail?: NFTItemBaseExpand;
  tokenDetail?: TokenItemShowType;
  viewPaymentSecurity?: ITransferLimitItemWithRoute;
};

export type TAssetComponentRef = {
  setPageState: (pageState: TAssetPageState) => void;
};
