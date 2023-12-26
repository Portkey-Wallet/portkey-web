import { IBaseRequest } from '@portkey-v1/types';
import { BaseListResponse, BaseService } from '../types';
import {
  AchNFTOrderInfo,
  AchNFTSignatureResult,
  AchNFTTokenResult,
  GetAchNFTSignatureParams,
  GetAchOrderInfoByOrderIdParams,
  GetAchSignatureParams,
  GetAchSignatureResult,
  GetAchTokenParams,
  GetAchTokenResult,
  GetCryptoListParams,
  GetCryptoListResult,
  GetFiatListParams,
  GetFiatListResult,
  GetOrderNoParams,
  GetOrderNoResult,
  GetOrderQuoteParams,
  GetOrderQuoteResult,
  IRampService,
  SendSellTransactionParams,
  SendSellTransactionResult,
} from '../types/ramp';

export class Ramp<T extends IBaseRequest = IBaseRequest> extends BaseService<T> implements IRampService {
  getAchNFTToken(params: GetAchTokenParams): Promise<AchNFTTokenResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/thirdPart/alchemy/token/nft',
      params,
    });
  }
  getAchNFTSignature(params: GetAchNFTSignatureParams): Promise<AchNFTSignatureResult> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/thirdPart/alchemy/signature/api',
      params,
    });
  }
  getAchNFTOrderInfoByOrderId(params: GetAchOrderInfoByOrderIdParams): Promise<BaseListResponse<AchNFTOrderInfo>> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/thirdPart/orders',
      params,
    });
  }
  getFiatList(params: GetFiatListParams): Promise<GetFiatListResult> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/thirdPart/alchemy/fiatList',
      params,
    });
  }
  getCryptoList(params: GetCryptoListParams): Promise<GetCryptoListResult> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/thirdPart/alchemy/cryptoList',
      params,
    });
  }
  getOrderQuote(params: GetOrderQuoteParams): Promise<GetOrderQuoteResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/thirdPart/alchemy/order/quote',
      params,
    });
  }
  getAchToken(params: GetAchTokenParams): Promise<GetAchTokenResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/thirdPart/alchemy/token',
      params,
    });
  }
  getOrderNo(params: GetOrderNoParams): Promise<GetOrderNoResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/thirdPart/order',
      params,
    });
  }
  getAchSignature(params: GetAchSignatureParams): Promise<GetAchSignatureResult> {
    return this._request.send({
      method: 'GET',
      url: '/api/app/thirdPart/alchemy/signature',
      params,
    });
  }
  sendSellTransaction(params: SendSellTransactionParams): Promise<SendSellTransactionResult> {
    return this._request.send({
      method: 'POST',
      url: '/api/app/thirdPart/alchemy/transaction',
      params,
    });
  }
}
