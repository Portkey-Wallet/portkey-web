import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import { ActivityItemType, ChainId } from '@portkey/types';
import { useDefaultToken } from '../../hooks/assets';
import { AmountSign, TransactionStatus } from '../../types/activity';
import { SHOW_FROM_TRANSACTION_TYPES } from '../../constants/activity';
import {
  addressFormat,
  dateFormatTransTo13,
  formatAmountShow,
  formatWithCommas,
  transNetworkText,
} from '../../utils/converter';
import { usePortkey } from '../context';
import { MAINNET } from '../../constants/network';
import { amountInUsdShow } from '../../utils/assets';
import { did, formatStr2EllipsisStr, getExploreLink, handleErrorMessage } from '../../utils';
import Copy from '../Copy';
import CustomSvg from '../CustomSvg';
import { getChain } from '../../hooks/useChainInfo';
import { useThrottleFirstEffect } from '../../hooks/throttle';
import { CaAddressInfosType } from '@portkey/services';
import './index.less';

export interface TransactionProps {
  transactionDetail: ActivityItemType;
  caAddressInfos: CaAddressInfosType;
  className?: string;
  chainId?: ChainId;
  onClose?: () => void;
}

export default function TransactionMain({
  chainId,
  className,
  caAddressInfos,
  transactionDetail,
  onClose,
}: TransactionProps) {
  const [{ networkType, chainType }] = usePortkey();
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);
  // Obtain data through routing to ensure that the page must have data and prevent Null Data Errors.
  const [activityItem, setActivityItem] = useState<ActivityItemType>(transactionDetail);
  const feeInfo = useMemo(() => activityItem.transactionFees, [activityItem.transactionFees]);
  const defaultToken = useDefaultToken(activityItem.fromChainId);

  // Obtain data through api to ensure data integrity.
  // Because some data is not returned in the Activities API. Such as from, to.
  useThrottleFirstEffect(() => {
    let _caAddressInfos = caAddressInfos;
    if (chainId) {
      _caAddressInfos = caAddressInfos?.filter((info) => info.chainId === chainId, []);
    }

    const params = {
      caAddressInfos: _caAddressInfos,
      transactionId: activityItem.transactionId,
      blockHash: activityItem.blockHash,
    };

    did.services.activity
      .getActivityDetail(params)
      .then((res) => {
        setActivityItem(res);
      })
      .catch((err) => {
        console.error('getActivityDetail:' + handleErrorMessage(err));
      });
  }, [caAddressInfos, chainId]);

  const status = useMemo(() => {
    if (activityItem?.status === TransactionStatus.Mined)
      return {
        text: 'Confirmed',
        style: 'confirmed',
      };
    return {
      text: 'Failed',
      style: 'failed',
    };
  }, [activityItem]);

  const isNft = useMemo(() => !!activityItem?.nftInfo?.nftId, [activityItem?.nftInfo?.nftId]);

  const nftHeaderUI = useCallback(() => {
    const { nftInfo, amount } = activityItem;
    return (
      <div className="nft-amount">
        <div className="assets">
          {nftInfo?.imageUrl ? (
            <img className="assets-img" src={nftInfo?.imageUrl} />
          ) : (
            <p>{nftInfo?.alias?.slice(0, 1)}</p>
          )}
        </div>
        <div className="info">
          <p className="index">
            <span>{nftInfo?.alias}</span>
            <span className="token-id">#{nftInfo?.nftId}</span>
          </p>
          <p className="quantity">{`Amount: ${amount}`}</p>
        </div>
      </div>
    );
  }, [activityItem]);

  const tokenHeaderUI = useCallback(() => {
    const { amount, isReceived, decimals, symbol, transactionType, priceInUsd } = activityItem;
    const sign = isReceived ? AmountSign.PLUS : AmountSign.MINUS;
    /* Hidden during [SocialRecovery, AddManager, RemoveManager] */
    if (transactionType && SHOW_FROM_TRANSACTION_TYPES.includes(transactionType)) {
      return (
        <p className="amount">
          {`${formatWithCommas({ amount, decimals, sign })} ${symbol ?? ''}`}
          {networkType === MAINNET && (
            <span className="usd">
              {amountInUsdShow({
                balance: amount,
                decimal: decimals || 0,
                price: priceInUsd || 0,
              })}
            </span>
          )}
        </p>
      );
    } else {
      return <p className="no-amount"></p>;
    }
  }, [activityItem, networkType]);

  const statusAndDateUI = useCallback(() => {
    return (
      <div className="status-wrap">
        <p className="label">
          <span className="left">Status</span>
          <span className="right">Date</span>
        </p>
        <p className="value">
          <span className={clsx(['left', status.style])}>{status.text}</span>
          <span className="right">{dateFormatTransTo13(activityItem.timestamp)}</span>
        </p>
      </div>
    );
  }, [activityItem.timestamp, status.style, status.text]);

  const fromToUI = useCallback(() => {
    const { from, fromAddress, fromChainId, to, toAddress, toChainId, transactionType } = activityItem;
    const transFromAddress = addressFormat(fromAddress, fromChainId, chainType);
    const transToAddress = addressFormat(toAddress, toChainId, chainType);

    /* Hidden during [SocialRecovery, AddManager, RemoveManager] */
    return (
      transactionType &&
      SHOW_FROM_TRANSACTION_TYPES.includes(transactionType) && (
        <div className="account-wrap">
          <p className="label">
            <span className="left">From</span>
            <span className="right">To</span>
          </p>
          <div className="value">
            <div className="content">
              <span className="left name">{from}</span>
              {fromAddress && (
                <span className="left address-wrap">
                  <span>{formatStr2EllipsisStr(transFromAddress, [7, 4])}</span>
                  <Copy toCopy={transFromAddress} iconClassName="copy-address" />
                </span>
              )}
            </div>
            <CustomSvg type="RightArrow" className="right-arrow" />
            <div className="content">
              <span className="right name">{to}</span>
              {toAddress && (
                <span className="right address-wrap">
                  <span>{formatStr2EllipsisStr(transToAddress, [7, 4])}</span>
                  <Copy toCopy={transToAddress} iconClassName="copy-address" />
                </span>
              )}
            </div>
          </div>
        </div>
      )
    );
  }, [activityItem, chainType]);

  const networkUI = useCallback(() => {
    /* Hidden during [SocialRecovery, AddManager, RemoveManager] */
    const { transactionType, fromChainId, toChainId } = activityItem;
    const from = transNetworkText(fromChainId, isMainnet);
    const to = transNetworkText(toChainId, isMainnet);

    return (
      transactionType &&
      SHOW_FROM_TRANSACTION_TYPES.includes(transactionType) && (
        <div className="network-wrap">
          <p className="label">
            <span className="left">Network</span>
          </p>
          <p className="value">{`${from}->${to}`}</p>
        </div>
      )
    );
  }, [activityItem, isMainnet]);

  const noFeeUI = useCallback(() => {
    return (
      <div className="right-item">
        <span>{`0 ELF`}</span> {isMainnet && <span className="right-usd">{`$ 0`}</span>}
      </div>
    );
  }, [isMainnet]);

  const feeUI = useCallback(() => {
    return activityItem.isDelegated ? (
      <div className="value">
        <span className="left">Transaction Fee</span>
        {noFeeUI()}
      </div>
    ) : (
      <div className="value">
        <span className="left">Transaction Fee</span>
        <span className="right">
          {(!feeInfo || feeInfo?.length === 0) && noFeeUI()}
          {feeInfo?.length > 0 &&
            feeInfo.map((item, idx) => {
              return (
                <div key={'transactionFee' + idx} className="right-item">
                  <span>{`${formatWithCommas({
                    amount: item.fee,
                    decimals: item.decimals || defaultToken.decimals,
                  })} ${item.symbol ?? ''}`}</span>
                  {isMainnet && <span className="right-usd">{`$ ${formatAmountShow(item.feeInUsd, 2)}`}</span>}
                </div>
              );
            })}
        </span>
      </div>
    );
  }, [activityItem.isDelegated, defaultToken.decimals, feeInfo, isMainnet, noFeeUI]);

  const transactionUI = useCallback(() => {
    return (
      <div className="money-wrap">
        <p className="label">
          <span className="left">Transaction</span>
        </p>
        <div>
          <div className="value">
            <span className="left">Transaction ID</span>
            <span className="right tx-id">
              {`${formatStr2EllipsisStr(activityItem.transactionId, [7, 4])} `}
              <Copy toCopy={activityItem.transactionId} />
            </span>
          </div>
          {feeUI()}
        </div>
      </div>
    );
  }, [activityItem.transactionId, feeUI]);

  const openOnExplorer = useCallback(async () => {
    const chainInfo = await getChain(activityItem.fromChainId);
    const exploreLink = getExploreLink(chainInfo?.explorerUrl || '', activityItem.transactionId || '', 'transaction');
    // TODO open by iframe
    window.open(exploreLink);
  }, [activityItem.fromChainId, activityItem.transactionId]);

  return (
    <div className={clsx('portkey-ui-transaction-detail', className)}>
      <div className="transaction-detail-body">
        <div className="header">
          <CustomSvg type="Close2" onClick={onClose} />
        </div>
        <div className="transaction-info">
          <div className="method-wrap">
            <p className="method-name">{activityItem?.transactionName}</p>
            {isNft ? nftHeaderUI() : tokenHeaderUI()}
          </div>
          {statusAndDateUI()}
          {fromToUI()}
          {networkUI()}
          {transactionUI()}
        </div>
      </div>
      <div className="transaction-footer">
        <div>
          {activityItem.transactionId && (
            <span className="link" onClick={openOnExplorer}>
              View on Explorer
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
