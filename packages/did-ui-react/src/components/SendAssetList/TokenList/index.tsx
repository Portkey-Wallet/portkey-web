import { IAssetToken } from '@portkey/services';
import { formatAmountUSDShow, formatTokenAmountShowWithDecimals } from '../../../utils/converter';
import { useCallback } from 'react';
import TokenChainImageDisplay from '../../TokenChainImageDisplay';
import Loading from '../../Loading';
import './index.less';

export interface SendTokenListProps {
  tokenInfos: IAssetToken[];
  noDataMessage: string;
  loading: boolean;
  isMainnet?: boolean;
  onSelect: (tokenItem: IAssetToken) => void;
}

export default function SendTokenList({
  tokenInfos = [],
  noDataMessage,
  loading,
  isMainnet = false,
  onSelect,
}: SendTokenListProps) {
  // TODO-SA
  const hideAssets = false;

  const renderItem = useCallback(
    (item: IAssetToken) => {
      return (
        <div
          key={`${item.symbol}_${item.chainId}`}
          className="token-item portkey-ui-flex gap-8 portkey-ui-cursor-pointer"
          onClick={() => onSelect(item)}>
          <div className="token-icon-show">
            <TokenChainImageDisplay tokenSrc={item.imageUrl} chainSrc={item?.chainImageUrl} symbol={item.symbol} />
          </div>
          <div className="token-info-show gap-8 portkey-ui-flex-1 portkey-ui-flex-between-center">
            <div className="token-info-symbol">
              <div className="token-symbol">{item.label || item.symbol}</div>
              <div className="token-chain">{`${item.displayChainName || ''} ${isMainnet ? '' : 'Testnet'}`}</div>
            </div>
            <div className="token-info-amount">
              <div className="token-amount">
                {hideAssets ? '******' : formatTokenAmountShowWithDecimals(item.balance, item.decimals)}
              </div>
              {!isMainnet && item.balanceInUsd && (
                <div className="token-usd">{hideAssets ? '******' : formatAmountUSDShow(item.balanceInUsd)}</div>
              )}
            </div>
          </div>
        </div>
      );
    },
    [isMainnet, hideAssets, onSelect],
  );

  return (
    <div className="select-send-token-list">
      {loading ? (
        <Loading />
      ) : tokenInfos.length === 0 ? (
        <div className="no-data-message portkey-ui-flex-center">{noDataMessage}</div>
      ) : (
        tokenInfos.map((item) => renderItem(item))
      )}
    </div>
  );
}
