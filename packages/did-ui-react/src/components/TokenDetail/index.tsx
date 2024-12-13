import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import clsx from 'clsx';

import './index.less';
import { BaseToken, IFaucetConfig, TokenItemShowType, TokenType } from '../types/assets';
import { usePortkey } from '../context';
import { MAINNET } from '../../constants/network';
import { divDecimals, formatAmountShow, transNetworkText } from '../../utils/converter';
import BalanceCard from '../BalanceCard';
import Activity from '../Activity';
import { ActivityItemType, ChainId } from '@portkey/types';
import { useFaucet } from '../../hooks/useFaucet';
import SettingHeader from '../SettingHeader';
import { SHOW_RAMP_CHAIN_ID_LIST, SHOW_RAMP_SYMBOL_LIST } from '../../constants/ramp';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import TokenImageDisplay from '../TokenImageDisplay';
import { PullToRefresh } from 'antd-mobile';
import LoadingIndicator from '../Loading';

export enum TokenTransferStatus {
  CONFIRMED = 'Confirmed',
  SENDING = 'Sending',
}

export interface TokenDetailProps {
  tokenInfo: TokenItemShowType;
  isShowRamp?: boolean;
  isShowFaucet?: boolean;
  faucet?: IFaucetConfig;
  onBack?: () => void;
  onReceive?: (selectToken: BaseToken) => void;
  onBuy?: (selectToken: BaseToken) => void;
  onSend?: (selectToken: TokenItemShowType, type: TokenType) => void;
  onDataInit?: () => void;
  onDataInitEnd?: () => void;

  onViewActivityItem?: (item: ActivityItemType & { chainId: ChainId }) => void;
}

enum ChainMapping {
  AELF = 'aelf MainChain',
  tDVW = 'aelf dAppChain',
  tDVV = 'aelf dAppChain',
}

function TokenDetailMain({
  tokenInfo,
  isShowRamp,
  faucet,
  onBack,
  onBuy,
  onSend,
  onReceive,
  onDataInit,
  onDataInitEnd,
  onViewActivityItem,
}: TokenDetailProps) {
  const [, forceRerender] = useReducer((x) => x + 1, 0);
  const [{ networkType }] = usePortkey();
  const [chainId, setChainId] = useState<ChainId>('AELF');
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);
  const [{ tokenListInfo }] = usePortkeyAsset();

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const selectorRef = useRef<HTMLDivElement | null>(null);

  const isShowBuy = useMemo(
    () =>
      SHOW_RAMP_SYMBOL_LIST.includes(tokenInfo.symbol) &&
      SHOW_RAMP_CHAIN_ID_LIST.includes(tokenInfo.chainId) &&
      isShowRamp,
    [tokenInfo.chainId, tokenInfo.symbol, isShowRamp],
  );
  const onFaucet = useFaucet(faucet);

  const tokenBalance = useMemo(() => {
    return tokenListInfo?.list.find((item) => item.symbol === tokenInfo.symbol && item.chainId === chainId);
  }, [tokenInfo.symbol, tokenListInfo?.list, chainId]);

  const networkList: TokenItemShowType[] = useMemo(() => {
    return tokenListInfo?.list.filter((item) => item.symbol === tokenInfo.symbol).reverse() || [];
  }, [tokenInfo.symbol, tokenListInfo?.list]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, 2);
  }, []);

  useEffect(() => {
    updateSelectorPosition();
  }, [activeIndex]);

  const updateSelectorPosition = () => {
    const currentItem = itemRefs.current[activeIndex];
    if (currentItem && selectorRef.current) {
      selectorRef.current.style.transform = `translateX(${currentItem.offsetLeft}px)`;
      selectorRef.current.style.width = `${currentItem.offsetWidth}px`;
    }
  };

  const handleClick = (index: number, chainId: ChainId) => {
    setActiveIndex(index);
    setChainId(chainId);
  };

  return (
    <div className={clsx(['portkey-ui-token-detail'])}>
      <div className="token-detail-title">
        <SettingHeader
          // className="setting-header-wrapper"
          title={
            <div className="token-detail-header">
              <TokenImageDisplay src={tokenInfo.imageUrl} symbol={tokenInfo?.symbol} width={32} />
              <p className="symbol">{tokenInfo?.label || tokenInfo?.symbol}</p>
            </div>
          }
          leftCallBack={onBack}
        />
        <div className="toggle-slider-container">
          <div ref={selectorRef} className="selector-bg" />
          <div className="toggle-slider-items">
            {networkList.map((item, index) => (
              <div
                key={index}
                className={`toggle-slider-item ${activeIndex === index ? 'active' : ''}`}
                onClick={() => handleClick(index, item.chainId)}
                ref={(el) => (itemRefs.current[index] = el)}>
                {ChainMapping[item.chainId]}
              </div>
            ))}
          </div>
        </div>
      </div>
      <PullToRefresh
        headHeight={100}
        pullingText={<LoadingIndicator width={28} height={28} />}
        canReleaseText={<LoadingIndicator width={28} height={28} />}
        completeText={<LoadingIndicator width={28} height={28} />}
        refreshingText={<LoadingIndicator width={28} height={28} />}
        onRefresh={() => {
          setChainId(chainId);
          forceRerender();
          return Promise.resolve('ok');
        }}>
        <div className="token-detail-content">
          <div className="balance">
            <div className="balance-amount">
              <span className="amount">
                {formatAmountShow(divDecimals(tokenBalance?.balance, tokenInfo.decimals))}{' '}
                {tokenInfo?.label || tokenInfo.symbol}
              </span>
              <span className="convert">{`$ ${formatAmountShow(tokenBalance?.balanceInUsd || 0, 2)}`}</span>
            </div>
            <BalanceCard
              isShowRamp={isShowBuy}
              isShowFaucet={
                Boolean(faucet?.faucetContractAddress || faucet?.faucetUrl) &&
                tokenInfo.chainId === 'AELF' &&
                tokenInfo.symbol === 'ELF'
              }
              isMainnet={isMainnet}
              onBuy={() => onBuy?.(tokenInfo)}
              onSend={() => onSend?.(tokenInfo, 'TOKEN')}
              onReceive={() => onReceive?.(tokenInfo)}
              onFaucet={onFaucet}
            />
          </div>
        </div>
        <div className="token-detail-history">
          <Activity
            key={new Date().toString()}
            chainId={chainId}
            symbol={tokenInfo.symbol}
            onDataInit={onDataInit}
            onDataInitEnd={onDataInitEnd}
            onViewActivityItem={(v) => onViewActivityItem?.({ ...v, chainId: tokenInfo.chainId })}
          />
        </div>
      </PullToRefresh>
    </div>
  );
}

export default TokenDetailMain;
