import clsx from 'clsx';
import './index.less';
import { useCallback, useMemo } from 'react';
import { TCurrency } from '@portkey/types';
import { useIsMainnet } from '../../../../hooks/common';
import TokenImageDisplay from '../../../TokenImageDisplay';
import { formatNameWithNoUnderline } from '../../../../utils/format';
import { formatTokenAmountShowWithDecimals } from '../../../../utils/converter';

export type TCurrencyItemProps = {
  className?: string;
  isChainNameShow?: boolean;
  item: TCurrency;
  balance?: string;
  balanceInUsd?: string;
  onClick?: (item: TCurrency) => void;
};
export const CurrencyItem = ({
  item,
  onClick,
  className,
  isChainNameShow = true,
  balance,
  balanceInUsd,
}: TCurrencyItemProps) => {
  const isMainnet = useIsMainnet();

  const onPress = useCallback(() => {
    onClick?.(item);
  }, [item, onClick]);

  const balanceInUsdText = useMemo(() => {
    if (balanceInUsd) return balanceInUsd;
    return `$${Number(balanceInUsd ?? item.balanceInUsd ?? 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    })}`;
  }, [balanceInUsd, item.balanceInUsd]);

  return (
    <div className={clsx('currency-item-wrap', className)} onClick={onPress}>
      <div className="currency-item-token-image-wrap">
        <TokenImageDisplay width={40} symbol={item?.symbol} src={item?.imageUrl} />
        <TokenImageDisplay
          className="currency-item-chain-image"
          width={20}
          symbol={item?.displayChainName}
          src={item?.chainImageUrl}
        />
      </div>

      <div className="currency-item-body">
        <div className="currency-item-title">{formatNameWithNoUnderline(item.label || item.symbol)}</div>

        {isChainNameShow && item.displayChainName && (
          <div className="currency-item-sub-title">{item.displayChainName}</div>
        )}
      </div>

      <div className="currency-item-suffix">
        <div className="currency-item-title">
          {balance ?? formatTokenAmountShowWithDecimals(item.balance, item.decimals)}
        </div>

        {isMainnet && item.balanceInUsd && <div className="currency-item-sub-title">{balanceInUsdText}</div>}
      </div>
    </div>
  );
};
