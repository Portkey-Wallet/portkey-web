import { ChainId } from '@portkey/types';

export type ITokenItemResponse = {
  decimals: number;
  symbol: string;
  tokenContractAddress: string;
  balance: string;
  chainId: string;
  balanceInUsd: string;
  imageUrl: string;
  price: number;
};

export type FetchAccountTokenListParams = {
  skipCount?: number;
  maxResultCount?: number;
  caAddresses: string[];
  caAddressInfos: { chainId: string; caAddress: string }[];
};
export type FetchAccountTokenListResult = {
  data: ITokenItemResponse[];
  totalRecordCount: number;
};

export type GetSymbolImagesParams = {} | undefined;
export type GetSymbolImagesResult = {
  symbolImages: { [symbol: string]: string };
};

export type INftCollection = {
  chainId: ChainId;
  collectionName: string;
  imageUrl: string;
  itemCount: number;
  symbol: string;
};
export type FetchAccountNftCollectionListParams = {
  skipCount: number;
  maxResultCount: number;
  caAddressInfos: { chainId: string; caAddress: string }[];
  width: number;
  height: number;
};
export type FetchAccountNftCollectionListResult = {
  data: INftCollection[];
  totalRecordCount: number;
};

export type INftCollectionItem = {
  alias: string;
  balance: string;
  chainId: string;
  imageLargeUrl: string;
  imageUrl: string;
  symbol: string;
  tokenContractAddress: string;
  tokenId: string;
  totalSupply: string;
};
export type FetchAccountNftCollectionItemListParams = {
  symbol: string;
  caAddressInfos: { chainId: string; caAddress: string }[];
  skipCount: number;
  maxResultCount: number;
  width: number;
  height: number;
};
export type FetchAccountNftCollectionItemListResult = {
  data: INftCollectionItem[];
  totalRecordCount: number;
};

export type FetchTokenPriceParams = {
  symbols: string[];
};
export type FetchTokenPriceResult = {
  items: { symbol: string; priceInUsd: number }[];
  totalRecordCount: number;
};

export type IUserTokenItem = {
  isDisplay: boolean;
  isDefault: boolean;
  id: string;
  token: {
    chainId: ChainId;
    decimals: number;
    address: string;
    symbol: string;
    id: string;
  };
};
export type GetUserTokenListParams = {
  keyword: string;
  chainIdArray: string[];
};
export type GetUserTokenListResult = {
  items: IUserTokenItem[];
  totalRecordCount: number;
};
export interface IAssetsService {
  fetchAccountTokenList(params: FetchAccountTokenListParams): Promise<FetchAccountTokenListResult>;
  getSymbolImages(params: GetSymbolImagesParams): Promise<GetSymbolImagesResult>;
  fetchAccountNftCollectionList(
    params: FetchAccountNftCollectionListParams,
  ): Promise<FetchAccountNftCollectionListResult>;
  fetchAccountNftCollectionItemList(
    params: FetchAccountNftCollectionItemListParams,
  ): Promise<FetchAccountNftCollectionItemListResult>;
  fetchTokenPrice(params: FetchTokenPriceParams): Promise<FetchTokenPriceResult>;
  getUserTokenList(params: GetUserTokenListParams): Promise<GetUserTokenListResult>;
}
