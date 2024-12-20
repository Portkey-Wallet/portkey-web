import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityItemType, ChainId, TDappOperations, TransactionEnum } from '@portkey/types';
import { useDefaultToken } from '../../hooks/assets';
import { AmountSign, TransactionStatus } from '../../types/activity';
import { SHOW_FROM_TRANSACTION_TYPES } from '../../constants/activity';
import {
  addressFormat,
  dateFormatTransTo13,
  divDecimals,
  divDecimalsStr,
  formatAmountShow,
  formatWithCommas,
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
import NFTImage from '../NFTImage';
import CommonButton from '../CommonButton';
import CoinImage from '../CoinImage';

export interface TransactionProps {
  transactionDetail: ActivityItemType | undefined;
  caAddressInfos: CaAddressInfosType | undefined;
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
  const [activityItem, setActivityItem] = useState<ActivityItemType | undefined>(transactionDetail);
  const feeInfo = useMemo(() => activityItem?.transactionFees, [activityItem?.transactionFees]);
  const defaultToken = useDefaultToken(activityItem?.fromChainId);

  const isEmptyToken = useMemo(
    () => !(activityItem?.nftInfo || activityItem?.symbol || activityItem?.operations?.length),
    [activityItem?.nftInfo, activityItem?.operations?.length, activityItem?.symbol],
  );
  const isDappTx = useMemo(() => !!activityItem?.dappName, [activityItem?.dappName]);
  const isShowEmptyTokenForDapp = useMemo(() => isEmptyToken && isDappTx, [isDappTx, isEmptyToken]);
  const isShowSystemForDefault = useMemo(() => isEmptyToken && !isDappTx, [isDappTx, isEmptyToken]);
  const isMultiTokenTx = useMemo(
    () => activityItem?.operations?.length && activityItem.operations.length >= 2,
    [activityItem?.operations?.length],
  );

  useEffect(() => {
    if (transactionDetail) {
      setActivityItem(transactionDetail);
    }
  }, [transactionDetail]);

  // Obtain data through api to ensure data integrity.
  // Because some data is not returned in the Activities API. Such as from, to.
  useThrottleFirstEffect(() => {
    if (caAddressInfos && activityItem) {
      let _caAddressInfos = caAddressInfos;
      if (chainId) {
        _caAddressInfos = caAddressInfos?.filter((info) => info.chainId === chainId, []);
      }

      const params = {
        caAddressInfos: _caAddressInfos,
        transactionId: activityItem?.transactionId,
        blockHash: activityItem?.blockHash,
      };

      did.services.activity
        .getActivityDetail(params)
        .then((res: ActivityItemType) => {
          setActivityItem(res);
        })
        .catch((err: any) => {
          console.error('getActivityDetail:' + handleErrorMessage(err));
        });
    }
  }, [caAddressInfos, chainId]);

  const status = useMemo(() => {
    if (activityItem?.status === TransactionStatus.Mined)
      return {
        text: 'Success',
        style: 'success',
      };
    return {
      text: 'Failed',
      style: 'failed',
    };
  }, [activityItem]);

  const isNft = useMemo(() => !!activityItem?.nftInfo?.nftId, [activityItem?.nftInfo?.nftId]);

  const nftHeaderUI = useMemo(() => {
    const { nftInfo, amount, decimals } = activityItem || {};
    return (
      <div className="nft-amount">
        <NFTImage
          name={nftInfo?.alias}
          imageUrl={nftInfo?.imageUrl}
          isSeed={nftInfo?.isSeed}
          seedType={nftInfo?.seedType}
        />
        <div className="info">
          <p className="index">
            <span>{nftInfo?.alias}</span>
            <span className="token-id">#{nftInfo?.nftId}</span>
          </p>
          <p className="quantity">{`Amount: ${divDecimalsStr(amount, decimals)}`}</p>
        </div>
      </div>
    );
  }, [activityItem]);

  const renderTokenStatus = (statusIcon: string, transactionType: TransactionEnum | undefined) => {
    if (isShowSystemForDefault && transactionType === TransactionEnum.TRANSFER) {
      return (
        <div className="status-container">
          <CustomSvg type="ArrowDownThin" />
        </div>
      );
    }

    if (transactionType && !SHOW_FROM_TRANSACTION_TYPES.includes(transactionType)) {
      return null;
    }

    if (statusIcon) {
      return <img className="status-icon" src={statusIcon} />;
    }

    return null;
  };

  const renderListIcon = (listIcon: string, operations: TDappOperations[] = []) => {
    if (isMultiTokenTx) {
      let [top, bottom] = operations.map((_token) => ({
        symbol: _token.nftInfo ? _token.nftInfo.alias : _token.symbol,
        url: _token.nftInfo ? _token.nftInfo.imageUrl : _token.icon,
        isReceived: _token.isReceived,
        amount: _token.amount,
        decimals: _token.decimals,
      }));
      const sameDirection = top.isReceived === bottom.isReceived;
      if (!sameDirection && top.isReceived) {
        [bottom, top] = [top, bottom];
      }

      return (
        <div className="multi-token-container">
          <div className="token-wrapper">
            <CoinImage symbol={top.symbol} src={top.url} width={42} />
            <CoinImage symbol={bottom.symbol} className="icon bottom" src={bottom.url} width={42} />
          </div>
          <div className="token-direction-wrapper">
            <span>{top.symbol}</span>
            <CustomSvg type="ArrowRight" fillColor="var(--sds-color-icon-default-default)" />
            <span>{bottom.symbol}</span>
          </div>
        </div>
      );
    }

    if (isShowSystemForDefault) {
      return (
        <div className="default-token-container">
          <div className="token-wrapper">
            <CoinImage symbol={activityItem?.symbol} src={activityItem?.listIcon} width={60} />
            <img className="icon bottom" src={activityItem?.sourceIcon} />
          </div>
        </div>
      );
    }

    return <CoinImage src={listIcon} width={60} />;
  };

  const tokenHeaderUI = useMemo(() => {
    const { amount, isReceived, decimals, symbol, operations, priceInUsd, transactionType, listIcon, statusIcon } =
      activityItem || {};
    const sign = isReceived ? AmountSign.PLUS : AmountSign.MINUS;
    /* Hidden during [SocialRecovery, AddManager, RemoveManager] */

    return (
      <div className="token-header-container">
        <div className="token-icon-container">
          {renderListIcon(listIcon || '', operations)}
          {renderTokenStatus(statusIcon || '', transactionType)}
        </div>
        {transactionType && SHOW_FROM_TRANSACTION_TYPES.includes(transactionType) && (
          <div
            className={clsx('amount', {
              positive: isReceived,
            })}>
            <span>{`${formatWithCommas({ amount, decimals, sign })} ${symbol ?? ''}`}</span>
            <span className="usd">
              {amountInUsdShow({
                balance: amount || 0,
                decimal: decimals || 0,
                price: priceInUsd || 0,
              })}
            </span>
          </div>
        )}
      </div>
    );
  }, [activityItem]);

  const statusAndDateUI = useMemo(() => {
    return (
      <div className="status-container">
        <div className="row">
          <span>Date</span>
          <span>{dateFormatTransTo13(activityItem?.timestamp)}</span>
        </div>
        <div className="row">
          <span>Status</span>
          <span className={status.style}>{status.text}</span>
        </div>
      </div>
    );
  }, [activityItem?.timestamp, status.style, status.text]);

  const networkUI = useMemo(() => {
    const { transactionType, fromChainIdUpdated, toChainIdUpdated, fromChainIcon, toChainIcon } = activityItem || {};
    const isNetworkShow = transactionType && SHOW_FROM_TRANSACTION_TYPES.includes(transactionType);
    if (!isNetworkShow) {
      return null;
    }

    return (
      <div className="account-container">
        <div className="row">
          <span>Source Network</span>
          <span className="chain">
            <img className="chain-icon" src={fromChainIcon} />
            {fromChainIdUpdated}
          </span>
        </div>
        <div className="row">
          <span>Destination Network</span>
          <span className="chain">
            <img className="chain-icon" src={toChainIcon} />
            {toChainIdUpdated}
          </span>
        </div>
      </div>
    );
  }, [activityItem]);

  const fromOrToUI = useMemo(() => {
    const { fromAddress, fromChainId, toAddress, toChainId } = activityItem || {};

    const transFromAddress = addressFormat(fromAddress, fromChainId, chainType);
    const transToAddress = addressFormat(toAddress, toChainId, chainType);

    if (activityItem?.transactionType && SHOW_FROM_TRANSACTION_TYPES.includes(activityItem?.transactionType)) {
      if (activityItem?.dappName) return null;
      return activityItem?.isReceived ? (
        <div className="from-to-container">
          <div className="row">
            <span>From</span>
            <span>{formatStr2EllipsisStr(transFromAddress, [8, 9])}</span>
          </div>
        </div>
      ) : (
        <div className="from-to-container">
          <div className="row">
            <span>To</span>
            <span>{formatStr2EllipsisStr(transToAddress, [8, 9])}</span>
          </div>
        </div>
      );
    }

    return null;
  }, [activityItem, chainType]);

  const noFeeUI = useCallback(() => {
    return (
      <div className="right-item">
        <span>{`0 ELF`}</span> {isMainnet && <span className="right-usd">{`$ 0`}</span>}
      </div>
    );
  }, [isMainnet]);

  const feeUI = useCallback(() => {
    return activityItem?.isDelegated ? (
      noFeeUI()
    ) : (
      <>
        {(!feeInfo || feeInfo?.length === 0) && noFeeUI()}
        {feeInfo &&
          feeInfo?.length > 0 &&
          feeInfo?.map((item, idx) => {
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
      </>
    );
  }, [activityItem?.isDelegated, defaultToken.decimals, feeInfo, isMainnet, noFeeUI]);

  const transactionUI = useMemo(() => {
    console.log(activityItem?.transactionId);
    return (
      <div className="transaction-container">
        {!activityItem?.isReceived && (
          <div className="row">
            <span>Network Fee</span>
            {feeUI()}
          </div>
        )}
        <div className="row">
          <span>Txn ID</span>
          <span className="txn-display">
            {formatStr2EllipsisStr(activityItem?.transactionId, [10], 'tail')}
            <Copy toCopy={activityItem?.transactionId || ''} />
          </span>
        </div>
      </div>
    );
  }, [activityItem]);

  const openOnExplorer = useCallback(async () => {
    if (activityItem?.fromChainId) {
      const chainInfo = await getChain(activityItem?.fromChainId);
      const exploreLink = getExploreLink(
        chainInfo?.explorerUrl || '',
        activityItem?.transactionId || '',
        'transaction',
      );
      // TODO open by iframe
      window.open(exploreLink);
    }
  }, [activityItem?.fromChainId, activityItem?.transactionId]);

  const dappTXDetailUI = useMemo(() => {
    const { dappName, transactionType } = activityItem || {};
    console.log(dappName);
    console.log(transactionType);

    console.log(activityItem);
    if (
      isMultiTokenTx &&
      activityItem?.dappName &&
      activityItem?.transactionType &&
      SHOW_FROM_TRANSACTION_TYPES.includes(activityItem.transactionType)
    ) {
      let [tokenPaid, tokenReceived] =
        activityItem.operations?.map((_token) => ({
          symbol: _token.nftInfo ? _token.nftInfo.alias : _token.symbol,
          url: _token.nftInfo ? _token.nftInfo.imageUrl : _token.icon,
          isReceived: _token.isReceived,
          amount: _token.amount,
          decimals: _token.decimals,
        })) || [];
      if (tokenPaid.isReceived) {
        [tokenPaid, tokenReceived] = [tokenReceived, tokenPaid];
      }

      return (
        <div className="dappTxDetail-container">
          <div className="row">
            <span>Provider</span>
            <span>{dappName}</span>
          </div>
          <div className="row">
            <span>You paid</span>
            <span>
              {`${tokenPaid?.isReceived ? '+' : '-'} ${formatAmountShow(
                divDecimals(tokenPaid?.amount, tokenPaid?.decimals),
                tokenPaid?.decimals,
              )} ${tokenPaid?.symbol || ''}`}
            </span>
          </div>
          <div className="row">
            <span>You received</span>
            <span>
              {`${tokenReceived?.isReceived ? '+' : '-'} ${formatAmountShow(
                divDecimals(tokenReceived?.amount, tokenReceived?.decimals),
                tokenReceived?.decimals,
              )} ${tokenReceived?.symbol || ''}`}
            </span>
          </div>
        </div>
      );
    }

    return null;
  }, [activityItem, isMultiTokenTx]);
  return (
    <div className={clsx('portkey-ui-transaction-detail', className)}>
      <div className="transaction-detail-body">
        <div className="transaction-detail-header">
          <span className="title">{transactionDetail?.transactionName}</span>
          <CustomSvg type="Close2" fillColor="var(--portkey-ui-text-primary)" onClick={onClose} />
        </div>
        <div className="transaction-detail-content">
          {isNft ? nftHeaderUI : tokenHeaderUI}
          {statusAndDateUI}
          {fromOrToUI}
          {networkUI}
          {transactionUI}
          {dappTXDetailUI}
        </div>
      </div>
      <div className="transaction-detail-footer">
        {activityItem?.transactionId && (
          // <span className="link" onClick={openOnExplorer}>
          //   View on Explorer
          // </span>
          <CommonButton className="item-button" type="primary" onClick={openOnExplorer}>
            View on Explorer
          </CommonButton>
        )}
      </div>
    </div>
  );
}
