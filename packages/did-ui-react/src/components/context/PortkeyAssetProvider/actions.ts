import { ChainId, IBaseWalletAccount } from '@portkey/types';
import { basicActions } from '../utils';
import { DIDWallet } from '@portkey/did';
import { Guardian } from '@portkey/services';

const PortkeyActions = {
  destroy: 'DESTROY',
  setDIDWallet: 'setDIDWallet',
  setGuardianList: 'setGuardianList',
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
  guardianList?: Guardian[];
};

export interface AssetState extends WalletInfo, BaseAssetProps {}

export const basicAssetView = {
  setDIDWallet: {
    type: PortkeyActions['setDIDWallet'],
    actions: (walletInfo: WalletInfo) => basicActions(PortkeyActions['setDIDWallet'], walletInfo),
  },
  setGuardianList: {
    type: PortkeyActions['setGuardianList'],
    actions: (guardianList: Guardian[]) => basicActions(PortkeyActions['setGuardianList'], { guardianList }),
  },
  destroy: {
    type: PortkeyActions['destroy'],
    actions: () => basicActions(PortkeyActions['destroy']),
  },
};
