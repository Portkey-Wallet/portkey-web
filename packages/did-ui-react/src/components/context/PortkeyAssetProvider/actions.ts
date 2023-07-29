import { ChainId, IBaseWalletAccount } from '@portkey/types';
import { basicActions } from '../utils';
import { DIDWallet } from '@portkey/did';

const PortkeyActions = {
  destroy: 'DESTROY',
  setDIDWallet: 'setDIDWallet',
};
type WalletInfo = {
  caInfo: DIDWallet<IBaseWalletAccount>['caInfo'];
  accountInfo: DIDWallet<IBaseWalletAccount>['accountInfo'];
  managementAccount?: IBaseWalletAccount;
};

export type BaseAssetProps = {
  pin?: string;
  caHash?: string;
  originChainId: ChainId;
  managerPrivateKey?: string;
  didStorageKeyName?: string;
};

export interface AssetState extends WalletInfo, BaseAssetProps {}

export const basicAssetView = {
  setDIDWallet: {
    type: PortkeyActions['setDIDWallet'],
    actions: (walletInfo: WalletInfo) => basicActions(PortkeyActions['setDIDWallet'], walletInfo),
  },
  destroy: {
    type: PortkeyActions['destroy'],
    actions: () => basicActions(PortkeyActions['destroy']),
  },
};
