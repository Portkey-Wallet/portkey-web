import { formatAmountShow } from '../../../utils/converter';
import { ZERO } from '../../../constants/misc';
import { ILimitTextParams, IValidValueCheckParams } from '../../../types';
import { getApiRampShow } from './api';

export const limitText = ({ min, max, symbol }: ILimitTextParams) =>
  `Limit Amount ${formatAmountShow(min)}-${formatAmountShow(max)} ${symbol} `;

export const validValueCheck = ({ amount, min, max }: IValidValueCheckParams) => {
  return ZERO.plus(amount).isGreaterThanOrEqualTo(min) && ZERO.plus(amount).isLessThanOrEqualTo(max);
};

export const generateRateText = (crypto: string, exchange: string, fiat: string) => {
  return `1 ${crypto} ≈ ${formatAmountShow(exchange, 2)} ${fiat}`;
};

export const generateReceiveText = (receive: string, symbol: string) => {
  return `I will receive ≈ ${formatAmountShow(receive)} ${symbol}`;
};

export const mixRampShow = async ({
  isMainnet,
  isBuySectionShow,
  isSellSectionShow,
  isFetch,
}: {
  isMainnet: boolean;
  isBuySectionShow: boolean;
  isSellSectionShow: boolean;
  isFetch?: boolean;
}) => {
  const { isRampShow, isBuyShow, isSellShow } = await getApiRampShow(isMainnet, isFetch);

  return {
    isRampShow: isRampShow && isBuySectionShow && isSellSectionShow,
    isBuyShow: isBuySectionShow && isBuyShow,
    isSellShow: isSellSectionShow && isSellShow,
  };
};

export const mixRampBuyShow = async ({
  isMainnet,
  isBuySectionShow,
  isFetch,
}: {
  isMainnet: boolean;
  isBuySectionShow: boolean;
  isFetch?: boolean;
}) => {
  const { isBuyShow } = await getApiRampShow(isMainnet, isFetch);

  return {
    isBuyShow: isBuySectionShow && isBuyShow,
  };
};

export const mixRampSellShow = async ({
  isMainnet,
  isSellSectionShow,
  isFetch,
}: {
  isMainnet: boolean;
  isSellSectionShow: boolean;
  isFetch?: boolean;
}) => {
  const { isSellShow } = await getApiRampShow(isMainnet, isFetch);

  return {
    isSellShow: isSellSectionShow && isSellShow,
  };
};
