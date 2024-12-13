import { ChainId, INftInfoType, ITokenInfoType, SeedTypeEnum } from '@portkey/types';

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

export type CaAddressInfosType = { chainId: ChainId; caAddress: string }[];

export type FetchAccountTokenListParams = {
  skipCount?: number;
  maxResultCount?: number;
  caAddressInfos: CaAddressInfosType;
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
  isSeed: boolean;
  decimals: number;
  displayChainImage?: boolean;
  chainImageUrl?: string;
};

export type FetchAccountNftCollectionListParams = {
  skipCount: number;
  maxResultCount: number;
  caAddressInfos: CaAddressInfosType;
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
  decimals: number;
  isSeed: boolean;
  seedType: SeedTypeEnum;
  inscriptionName?: string;
  limitPerMint?: number;
  expires?: string;
  seedOwnedSymbol?: string;
  recommendedRefreshSeconds?: number;
  generation?: string;
  traits?: string;
  traitsPercentages?: TTraitsPercentage[];
  description?: string;
  chainImageUrl?: string;
};

export type TTraitsPercentage = { traitType: string; value: string; percent: string };

export type FetchAccountNftCollectionItemListParams = {
  symbol: string;
  caAddressInfos: CaAddressInfosType;
  skipCount: number;
  maxResultCount: number;
  width: number;
  height: number;
};
export type FetchAccountNftCollectionItemListResult = {
  data: INftCollectionItem[];
  totalRecordCount: number;
};

export type TFetchAccountNftItemParams = {
  symbol: string;
  caAddressInfos: CaAddressInfosType;
  width: number;
  height: number;
};

export type TFetchAccountNftItemResult = INftCollectionItem;

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
export type IUserTokenItemNew = {
  isDisplay: boolean;
  isDefault: boolean;
  id: string;
  chainId: ChainId;
  decimals: number;
  address: string;
  symbol: string;
  imageUrl: string;
  label?: string;
};
export type GetUserTokenListParams = {
  keyword: string;
  chainIdArray: string[];
};
export type GetUserTokenListResult = {
  items: IUserTokenItem[];
  totalRecordCount: number;
};
export type GetUserTokenListResultNew = {
  items: IUserTokenItemNew[];
  totalCount: number;
};

export type GetAccountAssetsByKeywordsParams = {
  maxResultCount: number;
  skipCount: number;
  keyword?: string;
  caAddressInfos: CaAddressInfosType;
  width?: number;
  height?: number;
};
export type GetAccountAssetsByKeywordsResult = {
  data: IAssetItemType[];
  totalRecordCount: number;
};
export interface IAssetItemType {
  chainId: string;
  symbol: string;
  label?: string;
  address: string;
  tokenInfo?: ITokenInfoType;
  nftInfo?: INftInfoType;
}

export interface IAssetsService {
  fetchAccountTokenList(params: FetchAccountTokenListParams): Promise<FetchAccountTokenListResult>;
  getSymbolImages(params: GetSymbolImagesParams): Promise<GetSymbolImagesResult>;
  fetchAccountNftCollectionList(
    params: FetchAccountNftCollectionListParams,
  ): Promise<FetchAccountNftCollectionListResult>;
  fetchAccountNftCollectionItemList(
    params: FetchAccountNftCollectionItemListParams,
  ): Promise<FetchAccountNftCollectionItemListResult>;
  fetchAccountNftItem(params: TFetchAccountNftItemParams): Promise<TFetchAccountNftItemResult>;
  fetchTokenPrice(params: FetchTokenPriceParams): Promise<FetchTokenPriceResult>;
  getUserTokenList(params: GetUserTokenListParams): Promise<GetUserTokenListResult>;
  getUserTokenListNew(params: GetUserTokenListParams): Promise<GetUserTokenListResultNew>;
  getAccountAssetsByKeywords(params: GetAccountAssetsByKeywordsParams): Promise<GetAccountAssetsByKeywordsResult>;
}
