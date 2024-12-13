import { List } from 'antd-mobile';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { ActivityItemType, ChainId, ChainType } from '@portkey/types';
import { contractStatusEnum, SHOW_FROM_TRANSACTION_TYPES } from '../../constants/activity';
import { AmountSign, TransactionTypesEnum } from '../../types/activity';
import { addressFormat, formatAmountShow, formatWithCommas } from '../../utils/converter';
import { NetworkType } from '../../types';
import { formatStr2EllipsisStr } from '../../utils';
import { MAINNET } from '../../constants/network';
import LoadingMore from '../LoadingMore';
import './index.less';
import { formatActivityTimeRevamp, isSameDay } from '../../utils/time';
import { ZERO } from '../../constants/misc';
import ImgWithCornerMark from '../ImgWithCornerMark';
import LoadingIndicator from '../../components/Loading';
import classNames from 'classnames';
import ImgPair from '../ImgPair';

interface ActivityItemProps {
  isMainnet?: boolean;
  preItem?: ActivityItemType;
  item: ActivityItemType;
  onSelect?: (item: ActivityItemType) => void;
}

export const ActivityItem = ({ isMainnet, preItem, item, onSelect }: ActivityItemProps) => {
  const isDaySame = useMemo(() => {
    const preTime = dayjs.unix(Number(preItem?.timestamp || 0));
    const curTime = dayjs.unix(Number(item?.timestamp || 0));

    console.log('isSameDay(preTime, curTime)', isSameDay(preTime, curTime));
    return isSameDay(preTime, curTime);
  }, [item?.timestamp, preItem?.timestamp]);

  // new rules
  const isEmptyToken = useMemo(
    () => !(item?.nftInfo || item?.symbol || item?.operations?.length),
    [item?.nftInfo, item?.operations?.length, item?.symbol],
  );
  const isDappTx = useMemo(() => !!item?.dappName, [item?.dappName]);
  const isShowEmptyTokenForDapp = useMemo(() => isEmptyToken && isDappTx, [isDappTx, isEmptyToken]);
  const isShowSystemForDefault = useMemo(() => isEmptyToken && !isDappTx, [isDappTx, isEmptyToken]);
  const isShowTx = useMemo(() => !isEmptyToken, [isEmptyToken]);

  const AddressDom = useMemo(() => {
    const { fromAddress, fromChainId, nftInfo } = item;
    const transFromAddress = addressFormat(fromAddress, fromChainId);

    if (!item) {
      return null;
    }
    const address = item.isReceived ? item.fromAddress : item.toAddress;
    const chainId = item.isReceived ? item.fromChainId : item.toChainId;

    if (!address || !chainId || address === '_') {
      // Issue
      return null;
    }

    return (
      <span className="address">{`${item?.isReceived ? 'From' : 'To'} ${formatStr2EllipsisStr(
        transFromAddress,
        [6, 8],
      )}`}</span>
    );
  }, [item]);

  const AmountDom = useMemo(() => {
    const { amount = '', isReceived, decimals = 8, symbol, nftInfo } = item || {};
    let prefix = AmountSign.EMPTY;
    if (amount && !ZERO.isEqualTo(amount)) {
      prefix = isReceived ? AmountSign.PLUS : AmountSign.MINUS;
    }
    const suffix = nftInfo?.alias || symbol || '';
    const amountText = `${formatWithCommas({
      sign: prefix,
      amount,
      decimals,
      digits: 4,
    })} ${suffix ?? ''}`;

    const isSmallSize = amountText?.length > 10;

    return (
      <span
        className={classNames([
          'amount',
          { 'yellow-text': prefix === AmountSign.PLUS, 'small-size-text': isSmallSize },
        ])}>
        {amountText}
      </span>
    );
  }, [item]);

  const loadingStatus = useMemo(() => {
    return (
      <div className="loading-wrap">
        <LoadingIndicator width={24} height={24} />
      </div>
    );
  }, []);

  const ExtraDom = useMemo(() => {
    if (!item?.currentTxPriceInUsd) {
      return null;
    }
    return (
      <span className="amount-usd">{isMainnet ? `$ ${formatAmountShow(item.currentTxPriceInUsd || 0, 2)}` : ''}</span>
    );
  }, [isMainnet, item.currentTxPriceInUsd]);

  const SystemActivityItem = useMemo(() => {
    return (
      <>
        <div className="activity-left-section">
          {item?.status === contractStatusEnum.PENDING ? (
            loadingStatus
          ) : item?.sourceIcon ? (
            <ImgWithCornerMark imgSrc={item.listIcon || ''} cornerImgSrc={item?.sourceIcon || ''} />
          ) : (
            <img className="left-img" src={item?.listIcon || ''} />
          )}
        </div>
        <span className="activity-transaction-name">{item?.transactionName}</span>
      </>
    );
  }, [item?.listIcon, item?.sourceIcon, item?.status, item?.transactionName, loadingStatus]);

  const TxActivityItem = useMemo(() => {
    if (item?.operations?.length !== 0) {
      const { operations = [] } = item || {};
      if (operations.length < 2) {
        return null;
      }
      let [tokenTop, tokenBottom] = operations.map((_token) => ({
        symbol: _token.nftInfo ? _token.nftInfo.alias : _token.symbol,
        url: _token.nftInfo ? _token.nftInfo.imageUrl : _token.icon,
        isReceived: _token.isReceived,
        amount: _token.amount,
        decimals: _token.decimals,
      }));
      const sameDirection = tokenTop.isReceived === tokenBottom.isReceived;
      if (!sameDirection && !tokenTop.isReceived) {
        [tokenBottom, tokenTop] = [tokenTop, tokenBottom];
      }
      let renderTopIconInfo = { imageUrl: tokenTop.url, title: tokenTop.symbol };
      let renderBottomIconInfo = { imageUrl: tokenBottom.url, title: tokenBottom.symbol };
      if (!sameDirection) {
        [renderTopIconInfo, renderBottomIconInfo] = [renderBottomIconInfo, renderTopIconInfo];
      }

      const amountText = `${formatWithCommas({
        sign: tokenTop.isReceived ? AmountSign.PLUS : AmountSign.MINUS,
        amount: tokenTop.amount,
        decimals: tokenTop.decimals,
        digits: Number(tokenTop.decimals),
      })} ${tokenTop.symbol}`;
      const isSmallSize = amountText.length > 10;

      return (
        <>
          <div className="activity-left-section">
            {item?.status === contractStatusEnum.PENDING ? (
              loadingStatus
            ) : (
              <ImgPair imgSrc1={renderTopIconInfo.imageUrl} imgSrc2={renderBottomIconInfo.imageUrl} />
            )}
          </div>
          <div className="activity-center-section">
            <span className="transaction-name">{item?.transactionName}</span>
            <span className="dapp-name">{item?.dappName}</span>
          </div>
          <div className="activity-right-section">
            <span
              className={classNames([
                'amount',
                { 'yellow-text': tokenTop.isReceived, 'small-size-text': isSmallSize },
              ])}>
              {amountText}
            </span>
            {sameDirection ? (
              <span className="amount-usd">
                {`${formatWithCommas({
                  sign: tokenBottom.isReceived ? AmountSign.PLUS : AmountSign.MINUS,
                  amount: tokenBottom.amount,
                  decimals: tokenBottom.decimals,
                  digits: Number(tokenBottom.decimals),
                })} ${tokenBottom.symbol}`}
              </span>
            ) : (
              <span className="amount-usd">
                {`${formatWithCommas({
                  sign: tokenBottom.isReceived ? AmountSign.PLUS : AmountSign.MINUS,
                  amount: tokenBottom.amount,
                  decimals: tokenBottom.decimals,
                  digits: Number(tokenBottom.decimals),
                })} ${tokenBottom.symbol}`}
              </span>
            )}
          </div>
        </>
      );
    }

    const isTransferType = SHOW_FROM_TRANSACTION_TYPES.includes(item.transactionType);

    if (item?.dappName) {
      return (
        <>
          <div className="activity-left-section">
            {item.status === contractStatusEnum.PENDING ? (
              loadingStatus
            ) : item?.nftInfo ? (
              <img className="nft-img" src={item.nftInfo?.imageUrl} width={42} height={42} />
            ) : isTransferType ? (
              <ImgWithCornerMark
                imgSrc={item.listIcon || ''}
                cornerImgSrc={item.isReceived ? 'ReceiveActivity' : 'SendActivity'}
              />
            ) : (
              <img src={item?.listIcon || ''} width={420} height={42} />
            )}
          </div>

          <div className="activity-center-section">
            <span className="transaction-name">{item?.transactionName}</span>
            <span className="dapp-name">{item?.dappName}</span>
          </div>
          <div className="activity-right-section">
            {AmountDom}
            {ExtraDom}
          </div>
        </>
      );
    }

    return (
      <>
        <div className="activity-left-section">
          {item.status === contractStatusEnum.PENDING ? (
            loadingStatus
          ) : item?.nftInfo ? (
            <img className="nft-img" src={item.nftInfo?.imageUrl} width={42} height={42} />
          ) : isTransferType ? (
            <ImgWithCornerMark
              imgSrc={item.listIcon || ''}
              cornerImgSrc={item.isReceived ? 'ReceiveActivity' : 'SendActivity'}
            />
          ) : (
            <img src={item?.listIcon || ''} width={42} height={42} />
          )}
        </div>

        <div className="activity-center-section">
          <span className="transaction-name">{item?.transactionName}</span>
          {!item?.isSystem && (
            <>
              {AddressDom}
              {item?.transactionType === TransactionTypesEnum.CROSS_CHAIN_TRANSFER && (
                <span className="cross-chain-text">Cross-Chain Transfer</span>
              )}
            </>
          )}
        </div>

        <div className="activity-right-section">
          {AmountDom}
          {ExtraDom}
        </div>
      </>
    );
  }, [AddressDom, AmountDom, ExtraDom, item, loadingStatus]);

  const EmptyTokenForDapp = useMemo(() => {
    return (
      <>
        <div className="activity-left-section">
          {item?.status === contractStatusEnum.PENDING ? (
            loadingStatus
          ) : (
            <img src={item?.sourceIcon || ''} width={42} height={42} />
          )}
        </div>

        <div className="activity-center-section">
          <span className="transaction-name">{item?.transactionName}</span>
          <span className="dapp-name">{item?.dappName}</span>
        </div>
      </>
    );
  }, [item, loadingStatus]);

  return (
    <List.Item arrow={false} onClick={() => onSelect?.(item)}>
      {!isDaySame && (
        <div className="activity-time">{formatActivityTimeRevamp(dayjs.unix(Number(item?.timestamp || 0)))}</div>
      )}
      <div className="activity-item" onClick={() => onSelect?.(item)}>
        {isShowEmptyTokenForDapp && EmptyTokenForDapp}
        {isShowSystemForDefault && SystemActivityItem}
        {isShowTx && TxActivityItem}
      </div>
    </List.Item>
  );
};

export interface IActivityListProps {
  data?: ActivityItemType[];
  chainId?: ChainId;
  hasMore: boolean;
  networkType: NetworkType;
  chainType: ChainType;
  loadMore: (isRetry?: boolean) => Promise<void>;
  onSelect?: (item: ActivityItemType) => void;
}

export default function ActivityList({ data, networkType, hasMore, onSelect, loadMore }: IActivityListProps) {
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);

  return (
    <div className="activity-list">
      <List>
        {data?.map((item, index, arr) => (
          <ActivityItem
            key={`activityList_${item.transactionId}_${index}`}
            isMainnet={isMainnet}
            preItem={arr?.[index - 1]}
            item={item}
            onSelect={onSelect}
          />
        ))}
      </List>
      <LoadingMore hasMore={hasMore} loadMore={loadMore} className="load-more" />
    </div>
  );
}
