import { TokenItemShowType } from '../../../types/assets';
import { divDecimals, formatAmountShow, transNetworkText } from '../../../../utils/converter';
import BigNumber from 'bignumber.js';
import CheckFetchLoading from '../../../CheckFetchLoading';
import TokenImageDisplay from '../../../TokenImageDisplay';
import './index.less';

export default function TokenTab({
  isMainnet,
  tokenList,
  onViewTokenItem,
}: {
  isMainnet?: boolean;
  tokenList?: TokenItemShowType[];
  onViewTokenItem?: (v: TokenItemShowType) => void;
}) {
  return (
    <>
      <ul className="portkey-ui-token-list">
        {typeof tokenList === 'undefined' ? (
          <CheckFetchLoading list={tokenList} />
        ) : (
          tokenList?.map((item) => (
            <li
              className="token-list-item"
              key={`${item.chainId}_${item.symbol}`}
              onClick={() => onViewTokenItem?.(item)}>
              <TokenImageDisplay src={item.imageUrl} symbol={item.symbol} />

              <div className="desc">
                <div className="info">
                  <span>{item?.label || item.symbol}</span>
                  <span>{formatAmountShow(divDecimals(item.balance, item.decimals))}</span>
                </div>
                <div className="amount">
                  <p>{transNetworkText(item.chainId, isMainnet)}</p>
                  {isMainnet && item.balanceInUsd && (
                    <p className="convert">{`$ ${formatAmountShow(item.balanceInUsd)}`}</p>
                  )}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </>
  );
}
