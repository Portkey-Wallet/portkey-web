import { ChainType } from '@portkey/types';

export type NetworkItem = {
  name: string;
  walletType: ChainType;
  networkType: string;
  isActive?: boolean;
  apiUrl?: string;
  graphQLUrl?: string;
  networkIconUrl?: string;
  connectUrl?: string;
  tokenClaimContractAddress?: string;
};

export interface NetworkInfo {
  networkList?: NetworkItem[];
  /**
   * NetworkItem['networkType'];
   */
  defaultNetwork?: NetworkItem['networkType'];
}
