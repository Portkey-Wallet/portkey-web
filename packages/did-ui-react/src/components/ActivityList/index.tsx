import { List } from 'antd-mobile';
import { useCallback, useMemo } from 'react';
import { ActivityItemType, ChainId, ChainType, TransactionTypes } from '@portkey-v1/types';
import { SHOW_FROM_TRANSACTION_TYPES } from '../../constants/activity';
import { AmountSign } from '../../types/activity';
import {
  addressFormat,
  dateFormatTransTo13,
  formatAmountShow,
  formatWithCommas,
  transNetworkText,
} from '../../utils/converter';
import { NetworkType } from '../../types';
import { formatStr2EllipsisStr } from '../../utils';
import { MAINNET } from '../../constants/network';
import LoadingMore from '../LoadingMore';
import CustomSvg from '../CustomSvg';
import './index.less';

export interface IActivityListProps {
  data?: ActivityItemType[];
  chainId?: ChainId;
  hasMore: boolean;
  networkType: NetworkType;
  chainType: ChainType;
  loadMore: (isRetry?: boolean) => Promise<void>;
  onSelect?: (item: ActivityItemType) => void;
}

export default function ActivityList({
  data,
  networkType,
  chainType,
  hasMore,
  onSelect,
  loadMore,
}: IActivityListProps) {
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);

  const activityListLeftIcon = useCallback((type: TransactionTypes) => {
    return SHOW_FROM_TRANSACTION_TYPES.includes(type) ? 'Transfer' : 'SocialRecovery';
  }, []);

  const amountOrIdUI = (item: ActivityItemType) => {
    const { transactionName, isReceived, amount, symbol, nftInfo, decimals } = item;
    const sign = isReceived ? AmountSign.PLUS : AmountSign.MINUS;
    return (
      <p className="row-1">
        <span>{transactionName}</span>
        <span>
          <span>
            {nftInfo?.nftId && <span>#{nftInfo.nftId}</span>}
            {!nftInfo?.nftId && (
              <span>{`${formatWithCommas({ sign, amount, decimals, digits: 4 })} ${symbol ?? ''}`}</span>
            )}
          </span>
        </span>
      </p>
    );
  };

  const fromAndUsdUI = useCallback(
    (item: ActivityItemType) => {
      const { fromAddress, fromChainId, nftInfo } = item;
      const transFromAddress = addressFormat(fromAddress, fromChainId, chainType);

      return (
        <p className="row-2">
          <span>{`From: ${formatStr2EllipsisStr(transFromAddress, [7, 4])}`}</span>
          {nftInfo?.nftId && <span className="nft-name">{formatStr2EllipsisStr(nftInfo.alias)}</span>}
          {isMainnet && !nftInfo?.nftId && <span>{`$ ${formatAmountShow(item.priceInUsd || 0, 2)}`}</span>}
        </p>
      );
    },
    [chainType, isMainnet],
  );

  const networkUI = useCallback(
    (item: ActivityItemType) => {
      const { fromChainId, toChainId } = item;
      const from = transNetworkText(fromChainId, isMainnet);
      const to = transNetworkText(toChainId, isMainnet);

      return <p className="row-3">{`${from}->${to}`}</p>;
    },
    [isMainnet],
  );

  const notShowFromAndNetworkUI = useCallback(
    (item: ActivityItemType) => {
      const { isReceived, amount, symbol, decimals } = item;
      const sign = isReceived ? AmountSign.PLUS : AmountSign.MINUS;
      return (
        <div className="right right-not-from">
          <span>{item?.transactionName}</span>
          <div className="right-not-from-amount">
            <div>{`${formatWithCommas({ sign, amount, decimals, digits: 4 })} ${symbol ?? ''}`}</div>
            {isMainnet && <div className="usd">{`$ ${formatAmountShow(item.priceInUsd || 0, 2)}`}</div>}
          </div>
        </div>
      );
    },
    [isMainnet],
  );

  return (
    <div className="activity-list">
      <List>
        {data?.map((item, index) => (
          <List.Item key={`activityList_${item.transactionId}_${index}`}>
            <div className="activity-item" onClick={() => onSelect?.(item)}>
              <div className="time">{item.timestamp ? dateFormatTransTo13(Number(item.timestamp)) : ''}</div>
              <div className="info">
                {!!item.listIcon && (
                  <div
                    className="custom-list-icon"
                    style={{
                      backgroundImage: `url(${item.listIcon})`,
                    }}
                  />
                )}
                {!item.listIcon && <CustomSvg type={activityListLeftIcon(item.transactionType)} />}

                {/* [Transfer, CrossChainTransfer, ClaimToken] display the network and from UI */}
                {!SHOW_FROM_TRANSACTION_TYPES.includes(item.transactionType) ? (
                  notShowFromAndNetworkUI(item)
                ) : (
                  <div className="right">
                    {amountOrIdUI(item)}
                    {fromAndUsdUI(item)}
                    {networkUI(item)}
                  </div>
                )}
              </div>
            </div>
          </List.Item>
        ))}
      </List>
      <LoadingMore hasMore={hasMore} loadMore={loadMore} className="load-more" />
    </div>
  );
}
