import { IRequestDefaults, RequestOpts } from '@portkey/types';
import { RampType } from '../../src';
import {
  rampCryptoBuyResponse,
  rampCryptoSellResponse,
  rampDetailBuyResponse,
  rampDetailSellResponse,
  rampFiatBuyResponse,
  rampFiatSellResponse,
  rampInfoResponse,
  rampLimitBuyResponse,
  rampLimitSellResponse,
  rampPriceBuyResponse,
  rampPriceSellResponse,
} from './requestData';

export const commonResponse = (data: any) => {
  return {
    data,
    message: '',
    success: true,
    code: '20000',
  };
};

class RampFetchRequestMock {
  protected _defaults: IRequestDefaults;
  constructor(defaults: IRequestDefaults) {
    this._defaults = defaults;
  }
  async send(config: RequestOpts): Promise<any> {
    let result: any;
    switch (config.url) {
      case '/api/app/thirdPart/ramp/info':
        result = commonResponse(rampInfoResponse);
        break;
      case '/api/app/thirdPart/ramp/crypto':
        if (config?.params?.type === RampType.BUY) {
          result = commonResponse(rampCryptoBuyResponse);
        } else {
          result = commonResponse(rampCryptoSellResponse);
        }
        break;
      case '/api/app/thirdPart/ramp/fiat':
        if (config?.params?.type === RampType.BUY) {
          result = commonResponse(rampFiatBuyResponse);
        } else {
          result = commonResponse(rampFiatSellResponse);
        }

        break;
      case '/api/app/thirdPart/ramp/limit':
        if (config?.params?.type === RampType.BUY) {
          result = commonResponse(rampLimitBuyResponse);
        } else {
          result = commonResponse(rampLimitSellResponse);
        }

        break;
      case '/api/app/thirdPart/ramp/exchange':
        if (config?.params?.type === RampType.BUY) {
          result = commonResponse({
            exchange: '0.64',
          });
        } else {
          result = commonResponse({
            exchange: '0.65',
          });
        }

        break;
      case '/api/app/thirdPart/ramp/price':
        if (config?.params?.type === RampType.BUY) {
          result = commonResponse(rampPriceBuyResponse);
        } else {
          result = commonResponse(rampPriceSellResponse);
        }
        break;
      case '/api/app/thirdPart/ramp/detail':
        if (config?.params?.type === RampType.BUY) {
          result = commonResponse(rampDetailBuyResponse);
        } else {
          result = commonResponse(rampDetailSellResponse);
        }
        break;
      case '/api/app/thirdPart/ramp/transaction':
        result = commonResponse('success');
        break;
      case '/api/app/thirdPart/ramp/order':
        result = commonResponse({ orderId: '123abc' });
        break;
      case '/api/app/thirdPart/ramp/alchemy/token':
        result = commonResponse({ accessToken: 'accessToken' });
        break;
      case '/api/app/thirdPart/ramp/alchemy/signature':
        result = commonResponse({ signature: 'signature' });
        break;

      default:
        break;
    }
    return result;
  }
}

export default RampFetchRequestMock;
