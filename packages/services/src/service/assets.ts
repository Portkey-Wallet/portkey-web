import { ChainId, IBaseRequest } from '@portkey/types';
import { BaseService } from '../types';
import {
  FetchAccountNftCollectionItemListParams,
  FetchAccountNftCollectionItemListResult,
  FetchAccountNftCollectionListParams,
  FetchAccountNftCollectionListResult,
  FetchAccountTokenListParams,
  FetchAccountTokenListResult,
  FetchTokenPriceParams,
  FetchTokenPriceResult,
  GetAccountAssetsByKeywordsParams,
  GetAccountAssetsByKeywordsResult,
  GetSymbolImagesParams,
  GetSymbolImagesResult,
  GetUserTokenListParams,
  GetUserTokenListResult,
  GetUserTokenListResultNew,
  IAssetsService,
  ITokenSectionResponse,
  TFetchAccountNftItemParams,
  TFetchAccountNftItemResult,
} from '../types/assets';

export class Assets<T extends IBaseRequest = IBaseRequest> extends BaseService<T> implements IAssetsService {
  fetchAccountTokenList(params: FetchAccountTokenListParams): Promise<FetchAccountTokenListResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/user/assets/token',
      params,
    });
  }
  fetchAccountTokenListV2(params: FetchAccountTokenListParams): Promise<{
    data: ITokenSectionResponse[];
    totalRecordCount: number;
    totalBalanceInUsd?: string;
  }> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/v2/user/assets/token',
      params,
    });
  }
  getSymbolImages(params: GetSymbolImagesParams): Promise<GetSymbolImagesResult> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/user/assets/symbolImages',
      params,
    });
  }
  fetchAccountNftCollectionList(
    params: FetchAccountNftCollectionListParams,
  ): Promise<FetchAccountNftCollectionListResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/user/assets/nftCollections',
      params,
    });
  }
  fetchAccountNftCollectionItemList(
    params: FetchAccountNftCollectionItemListParams,
  ): Promise<FetchAccountNftCollectionItemListResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/user/assets/nftItems',
      params,
    });
  }
  fetchAccountNftItem(params: TFetchAccountNftItemParams): Promise<TFetchAccountNftItemResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/user/assets/nftItem',
      params,
    });
  }
  fetchTokenPrice(params: FetchTokenPriceParams): Promise<FetchTokenPriceResult> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/tokens/prices',
      params,
    });
  }
  getUserTokenList({ keyword, chainIdArray }: GetUserTokenListParams): Promise<GetUserTokenListResult> {
    const chainIdSearchLanguage = chainIdArray.map(chainId => `token.chainId:${chainId}`).join(' OR ');

    const filterKeywords =
      keyword.length < 10 ? `token.symbol: *${keyword.toUpperCase().trim()}*` : `token.address:${keyword}`;

    return this._request.send({
      method: 'GET',
      url: '/api/app/search/usertokenindex',
      params: {
        filter: `${filterKeywords} AND (${chainIdSearchLanguage})`,
        sort: 'sortWeight desc,isDisplay  desc,token.symbol  acs,token.chainId acs',
        skipCount: 0,
        maxResultCount: 1000,
      },
    });
  }

  getUserTokenListNew({ keyword, chainIdArray }: GetUserTokenListParams): Promise<GetUserTokenListResultNew> {
    // const chainIdSearchLanguage = chainIdArray.map(chainId => `token.chainId:${chainId}`).join(' OR ');

    // const filterKeywords =
    //   keyword.length < 10 ? `token.symbol: *${keyword.toUpperCase().trim()}*` : `token.address:${keyword}`;

    return this._request.send({
      method: 'GET',
      url: '/api/app/userTokens',
      params: {
        keyword: keyword,
        chainIds: chainIdArray,
        skipCount: 0,
        maxResultCount: 1000,
      },
    });
  }
  getUserTokenListNewV2({ keyword, chainIdArray }: GetUserTokenListParams): Promise<{
    data: {
      symbol: string;
      imageUrl?: string;
      label?: string;
      displayStatus?: 'All' | 'Partial' | 'None';
      isDefault?: boolean;
      tokens?: {
        id: string;
        chainId: ChainId;
        symbol: string;
        imageUrl?: string;
        address?: string;
        decimals: number;
        isDefault: boolean;
        isDisplay: boolean;
        label?: string;
      }[];
    }[];
    totalRecordCount: number;
  }> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/v2/userTokens',
      params: {
        keyword: keyword,
        chainIds: chainIdArray,
        skipCount: 0,
        maxResultCount: 1000,
      },
    });
  }

  getAccountAssetsByKeywords(params: GetAccountAssetsByKeywordsParams): Promise<GetAccountAssetsByKeywordsResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/user/assets/searchUserAssets',
      params,
    });
  }
}
