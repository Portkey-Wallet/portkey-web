import { divDecimals, formatAmountShow, transNetworkText } from '../../../../utils/converter';
import BigNumber from 'bignumber.js';
import { IAssetItemType } from '@portkey/services';
import TokenImageDisplay from '../../../TokenImageDisplay';

export default function AssetsTokenItem({
  isMainnet,
  token,
  onSelect,
}: {
  isMainnet: boolean;
  token: IAssetItemType;
  onSelect?: (select: IAssetItemType, type: 'TOKEN') => void;
}) {
  return (
    <div className="item" key={`${token.symbol}_${token.chainId}`} onClick={onSelect?.bind(undefined, token, 'TOKEN')}>
      <div className="icon">
        <TokenImageDisplay src={token.tokenInfo?.imageUrl} symbol={token.symbol} />
      </div>
      <div className="info">
        <p className="symbol">{`${token.symbol}`}</p>
        <p className="network">{transNetworkText(token.chainId, isMainnet)}</p>
      </div>
      <div className="amount">
        <p className="quantity">{formatAmountShow(divDecimals(token.tokenInfo?.balance, token.tokenInfo?.decimals))}</p>
        {isMainnet && token.tokenInfo?.balanceInUsd && !BigNumber(token.tokenInfo.balanceInUsd).isZero() && (
          <p className="convert">{`$ ${formatAmountShow(token.tokenInfo.balanceInUsd)}`}</p>
        )}
      </div>
    </div>
  );
}
