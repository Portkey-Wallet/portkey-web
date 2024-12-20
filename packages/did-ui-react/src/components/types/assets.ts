import { INftCollection, INftCollectionItem } from '@portkey/services';
import { ChainId, ChainType, SeedTypeEnum } from '@portkey/types';

export enum BalanceTab {
  TOKEN = 'token',
  NFT = 'nft',
  ACTIVITY = 'activity',
}

export interface BaseToken {
  id?: string; // id
  chainId: ChainId;
  decimals: number | string;
  address: string; // token  contract address
  symbol: string;
  label?: string;
  imageUrl?: string;
  chainImageUrl?: string;
  isNFT?: boolean;
}

export interface BaseTokenExpand extends BaseToken {
  name: string;
  imageUrl?: string;
  alias?: string;
  tokenId?: string; // nft tokenId
}

export interface AssetTokenExpand extends BaseTokenExpand {
  balanceInUsd?: string;
  balance?: string;
  isSeed?: boolean;
  seedType?: SeedTypeEnum;
}

export interface TokenItemType extends BaseTokenExpand {
  isDefault?: boolean; // boolean,
  tokenName?: string;
}

export interface TokenItemShowType extends TokenItemType {
  isAdded?: boolean; // boolean
  tokenContractAddress?: string;
  imageUrl?: string;
  balance?: string;
  balanceInUsd?: string;
  price?: string | number;
  userTokenId?: string;
}

export type ITokenSectionResponse = {
  chainId?: string;
  symbol: string;
  price?: number;
  balance?: string;
  decimals?: number;
  balanceInUsd?: string;
  label?: string;
  imageUrl?: string;
  displayStatus?: 'All' | 'Partial' | 'None';
  tokens?: TokenItemShowType[];
};

export type IUserTokenItem = Omit<TokenItemShowType, 'name' | 'address'> & { isDisplay?: boolean; address?: string };

export type IUserTokenItemResponse = {
  symbol: string;
  price?: number;
  balance?: string;
  decimals?: number;
  balanceInUsd?: string;
  label?: string;
  imageUrl?: string;
  isDefault?: boolean;
  displayStatus?: 'All' | 'Partial' | 'None';
  tokens?: IUserTokenItem[];
  chainImageUrl?: string;
  displayChainName?: string;
};

// nft item types
export type NFTItemBaseType = {
  chainId: ChainId;
  symbol: string;
  tokenId: string;
  alias: string;
  imageUrl: string;
  tokenContractAddress: string;
  totalSupply: string | number;
  balance: string;
  quantity: string;
};

export interface NFTItemBaseExpand extends INftCollectionItem {
  collectionName: string;
  collectionImageUrl: string;
}

export interface NFTCollectionItemShowType extends INftCollection {
  isFetching: boolean;
  skipCount: number;
  maxResultCount: number;
  totalRecordCount: string | number;
  children: INftCollectionItem[];
}

export interface IFaucetConfig {
  // Only when testing the network, you can configure the faucet address
  faucetUrl?: string;
  faucetContractAddress?: string;
}

export type TokenType = 'TOKEN' | 'NFT';

export interface IClickAddressProps {
  name?: string;
  isDisable?: boolean;
  chainId: ChainId;
  addressChainId?: string;
  address: string;
}

export enum TransactionError {
  TOKEN_NOT_ENOUGH = 'Insufficient funds',
  NFT_NOT_ENOUGH = 'Insufficient quantity',
  FEE_NOT_ENOUGH = 'Insufficient funds for transaction fee',
  CROSS_NOT_ENOUGH = 'Insufficient funds for cross-chain transaction fee',
}

export type the2ThFailedActivityItemType = {
  transactionId: string;
  params: {
    chainId: ChainId;
    chainType: ChainType;
    managerAddress: string;
    tokenInfo: BaseToken;
    tokenIssueChainId: number;
    amount: number;
    toAddress: string;
    memo?: string;
    sandboxId?: string;
  };
};
