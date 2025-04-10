import { ChainId, TSwapRoute } from '@portkey/types';

export type TAwakenCommonResult<T> = {
  code: string;
  data: T;
  message: string;
};

export type TGetSwapRoutesParams = {
  chainId: ChainId;
  symbolIn: string;
  symbolOut: string;
  routeType: 0 | 1;
  amountIn?: string;
  amountOut?: string;
};

export type TGetSwapRoutesResult = TAwakenCommonResult<{
  statusCode: number;
  message: string | null;
  routes: TSwapRoute[];
}>;

export type TGetAwakenGasFeeResult = TAwakenCommonResult<{
  transactionFee: number;
}>;

export type TGetAwakenTokenPriceParams = {
  chainId: string;
  tokenAddress: string;
  symbol: string;
};

export type TGetAwakenTokenPriceResult = TAwakenCommonResult<string>;

export interface IAwakenService {
  getSwapRoutes(params: TGetSwapRoutesParams): Promise<TGetSwapRoutesResult>;
  getAwakenGasFee(): Promise<TGetAwakenGasFeeResult>;
  getAwakenTokenPrice(params: TGetAwakenTokenPriceParams): Promise<TGetAwakenTokenPriceResult>;
}
