import { useMemo } from 'react';
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
  onViewActivityItem?: (item: ActivityItemType & { chainId: ChainId }) => void;
}

function TokenDetailMain({
  tokenInfo,
  isShowRamp,
  faucet,
  onBack,
  onBuy,
  onSend,
  onReceive,
  onViewActivityItem,
}: TokenDetailProps) {
  const [{ networkType }] = usePortkey();
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);

  const isShowBuy = useMemo(
    () =>
      SHOW_RAMP_SYMBOL_LIST.includes(tokenInfo.symbol) &&
      SHOW_RAMP_CHAIN_ID_LIST.includes(tokenInfo.chainId) &&
      isShowRamp,
    [tokenInfo.chainId, tokenInfo.symbol, isShowRamp],
  );
  const onFaucet = useFaucet(faucet);

  return (
    <div className={clsx(['portkey-ui-token-detail'])}>
      <div className="token-detail-title">
        <SettingHeader
          // className="setting-header-wrapper"
          title={
            <div className="title">
              <p className="symbol">{tokenInfo?.symbol}</p>
              <p className="network">{transNetworkText(tokenInfo.chainId, isMainnet)}</p>
            </div>
          }
          leftCallBack={onBack}
        />
      </div>
      <div className="token-detail-content">
        <div className="balance">
          <div className="balance-amount">
            <span className="amount">
              {formatAmountShow(divDecimals(tokenInfo.balance, tokenInfo.decimals))} {tokenInfo.symbol}
            </span>
            {isMainnet && <span className="convert">{`$ ${formatAmountShow(tokenInfo.balanceInUsd || 0)}`}</span>}
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
          chainId={tokenInfo.chainId}
          symbol={tokenInfo.symbol}
          onViewActivityItem={(v) => onViewActivityItem?.({ ...v, chainId: tokenInfo.chainId })}
        />
      </div>
    </div>
  );
}

export default TokenDetailMain;
