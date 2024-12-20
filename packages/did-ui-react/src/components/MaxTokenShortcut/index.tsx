import React from 'react';
import './index.less';
import { IRampCryptoItem } from '@portkey/ramp';
import TokenImageDisplay from '../TokenImageDisplay';
export interface IMaxTokenShortcutProps {
  className?: string;
  tokenInfo?: IRampCryptoItem;
  maxAmount: string;
  onMaxPress: () => void;
}
const MaxTokenShortcut = ({ className, tokenInfo, maxAmount, onMaxPress }: IMaxTokenShortcutProps) => {
  if (!tokenInfo) {
    return null;
  }
  return (
    <div className={`max-token-shortcut-token-wrap ${className}`}>
      <div className="max-token-shortcut-tokenInfoWrap">
        <TokenImageDisplay src={tokenInfo.icon} symbol={tokenInfo.symbol} width={42} />
        <div className="max-token-shortcut-tokenBalanceWrap">
          <div className="max-token-shortcut-tokenSymbolText">{tokenInfo?.symbol}</div>
          <div className="max-token-shortcut-tokenBalanceText">{`${maxAmount} available`}</div>
        </div>
      </div>

      <button className="max-token-shortcut-maxButton" onClick={onMaxPress}>
        <span className="max-token-shortcut-maxButtonText">Max</span>
      </button>
    </div>
  );
};

export default MaxTokenShortcut;
