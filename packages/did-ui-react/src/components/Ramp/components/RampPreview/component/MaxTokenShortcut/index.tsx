import React from 'react';
import './index.less';
import TokenImageDisplay from '../../../../../TokenImageDisplay';
import { IRampCryptoItem } from '@portkey/ramp';
export interface IMaxTokenShortcutProps {
  tokenInfo?: IRampCryptoItem;
  maxAmount: string;
  onMaxPress: () => void;
}
const MaxTokenShortcut = ({ tokenInfo, maxAmount, onMaxPress }: IMaxTokenShortcutProps) => {
  if (!tokenInfo) {
    return null;
  }
  return (
    <div className="max-token-shortcut-token-wrap">
      <div className="tokenInfoWrap">
        <TokenImageDisplay src={tokenInfo.icon} symbol={tokenInfo.symbol} width={42} />
        {/* <CommonAvatar
          hasBorder
          title={tokenInfo?.symbol}
          avatarSize={42} // pTd(42)
          imageUrl={tokenInfo?.imageUrl}
          svgName={tokenInfo?.svgName}
          titleStyle={{ fontSize: "11px" }} // FontStyles.font11
          borderStyle="hairlineBorder"
        /> */}
        <div className="tokenBalanceWrap">
          <div className="tokenSymbolText">{tokenInfo?.symbol}</div>
          <div className="tokenBalanceText">{`${maxAmount} available`}</div>
        </div>
      </div>

      <button className="maxButton" onClick={onMaxPress}>
        <span className="maxButtonText">Max</span>
      </button>
    </div>
  );
};

export default MaxTokenShortcut;
