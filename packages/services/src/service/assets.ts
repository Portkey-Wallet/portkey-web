import { IBaseRequest } from '@portkey-v1/types';
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
  IAssetsService,
} from '../types/assets';

export class Assets<T extends IBaseRequest = IBaseRequest> extends BaseService<T> implements IAssetsService {
  fetchAccountTokenList(params: FetchAccountTokenListParams): Promise<FetchAccountTokenListResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/user/assets/token',
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

  getAccountAssetsByKeywords(params: GetAccountAssetsByKeywordsParams): Promise<GetAccountAssetsByKeywordsResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/user/assets/searchUserAssets',
      params,
    });
  }
}
