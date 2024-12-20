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
  return `≈ ${formatAmountShow(receive)} ${symbol}`;
};

export const mixRampShow = async ({
  isMainnet,
  isRampEntryShow = true,
  isBuySectionShow,
  isSellSectionShow,
  isFetch,
}: {
  isMainnet: boolean;
  isRampEntryShow?: boolean;
  isBuySectionShow: boolean;
  isSellSectionShow: boolean;
  isFetch?: boolean;
}) => {
  const { isRampShow, isBuyShow, isSellShow } = await getApiRampShow(isMainnet, isFetch);

  return {
    isRampShow: isRampShow && isRampEntryShow,
    isBuyShow: isRampEntryShow && isBuySectionShow && isBuyShow,
    isSellShow: isRampEntryShow && isSellSectionShow && isSellShow,
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

export function transformAction(action: string) {
  if (action === 'BUY') return 'Buy';
  if (action === 'SELL') return 'Sell';
  return null;
}

export function isEqual(value: any, other: any): boolean {
  if (value === other) {
    return true;
  }

  if (typeof value !== typeof other) {
    return false;
  }

  if (value == null || other == null) {
    return value === other;
  }

  if (value instanceof Date && other instanceof Date) {
    return value.getTime() === other.getTime();
  }

  if (Array.isArray(value) && Array.isArray(other)) {
    if (value.length !== other.length) {
      return false;
    }
    return value.every((item, index) => isEqual(item, other[index]));
  }

  if (typeof value === 'object' && typeof other === 'object') {
    const valueKeys = Object.keys(value);
    const otherKeys = Object.keys(other);

    if (valueKeys.length !== otherKeys.length) {
      return false;
    }

    return valueKeys.every((key) => {
      return isEqual(value[key], other[key]);
    });
  }

  return false;
}
