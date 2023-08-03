import { ChainId } from '@portkey/types';

export enum BalanceTab {
  TOKEN = 'token',
  NFT = 'nft',
}

export interface BaseToken {
  id: string; // id
  chainId: ChainId;
  decimals: number;
  address: string; // token  contract address
  symbol: string;
}

export interface BaseTokenExpand extends BaseToken {
  name: string;
  imageUrl?: string;
  alias?: string;
  tokenId?: string; // nft tokenId
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

// nft item types
export type NFTItemBaseType = {
  chainId: ChainId;
  symbol: string;
  tokenId: string;
  alias: string;
  quantity: string;
  imageUrl: string;
  tokenContractAddress: string;
  totalSupply: string | number;
};
// nft collection types
export type NFTCollectionItemBaseType = {
  chainId: ChainId;
  collectionName: string;
  imageUrl: string;
  itemCount: number;
  symbol: string;
  decimals: number; // 0
};

export interface NFTCollectionItemShowType extends NFTCollectionItemBaseType {
  isFetching: boolean;
  skipCount: number;
  maxResultCount: number;
  totalRecordCount: string | number;
  children: NFTItemBaseType[];
}

export interface IFaucetConfig {
  // Only when testing the network, you can configure the faucet address
  faucetUrl?: string;
  faucetContractAddress?: string;
}
