import { Accounts, Address, ChainId, ChainIds, ChainsInfo, WalletName } from '@portkey/provider-types';
import { DIDWallet } from '@portkey/did';
import { portkey } from '@portkey/accounts';
import { ChainInfo } from '@portkey/services';
export interface IDappManager {
  isActive(): boolean;
  getWallet(): DIDWallet<portkey.WalletAccount>;
  isLogged(): boolean;
  accounts(origin: string): Promise<Accounts>;
  chainId(): Promise<ChainIds>;
  chainIds(): Promise<ChainIds>;
  chainsInfo(): Promise<ChainsInfo>;
  getChainInfo(chainId: ChainId): Promise<ChainInfo | undefined>;
  isLocked(): boolean;
  getRpcUrl(chainId: ChainId): Promise<string | undefined>;
  caHash(): string;
  walletName(): Promise<WalletName>;
  currentManagerAddress(): Promise<Address | undefined>;
  // getRememberMeBlackList(): Promise<string[] | undefined>;
  getOriginChainId(): Promise<ChainId>;
  // updateManagerSyncState(chainId: ChainId): Promise<void>;
}
