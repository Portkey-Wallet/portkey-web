import { TokenItemShowType, ITokenSectionResponse } from '../../../types/assets';
import { divDecimals, formatAmountShow, transNetworkText } from '../../../../utils/converter';
import CheckFetchLoading from '../../../CheckFetchLoading';
import TokenChainImageDisplay from '../../../TokenChainImageDisplay';
import './index.less';
import { useCallback, useState } from 'react';

export default function TokenTab({
  isMainnet,
  tokenListV2,
  onViewTokenItem,
}: {
  isMainnet?: boolean;
  tokenListV2?: ITokenSectionResponse[];
  onViewTokenItem?: (v: TokenItemShowType) => void;
}) {
  const [selectedItem, setSelectedItem] = useState(new Map<string, boolean>());

  const onClickSection = useCallback(
    (item: ITokenSectionResponse) => {
      if (item.tokens?.length === 1) {
        onViewTokenItem?.(item.tokens[0]);
      } else {
        selectedItem.set(item.symbol, !selectedItem.get(item.symbol));
        setSelectedItem(new Map(selectedItem));
      }
    },
    [onViewTokenItem, selectedItem],
  );

  return (
    <>
      <ul className="portkey-ui-token-list">
        {typeof tokenListV2 === 'undefined' ? (
          <CheckFetchLoading list={tokenListV2} />
        ) : (
          tokenListV2?.map((item) => (
            <>
              <li className="token-list-item" key={`${item.symbol}`} onClick={() => onClickSection?.(item)}>
                <TokenChainImageDisplay
                  tokenSrc={item.imageUrl}
                  symbol={item.symbol}
                  chainSrc={item.tokens?.length === 1 ? item.tokens[0].chainImageUrl : undefined}
                  chainCount={item.tokens?.length}
                />

                <div className="desc">
                  <div className="info">
                    <span>{item?.label || item.symbol}</span>
                    <span>{formatAmountShow(divDecimals(item.balance, item.decimals))}</span>
                  </div>
                  <div className="amount">
                    {isMainnet && item.price && <p className="convert">{`$${item.price}`}</p>}
                    {isMainnet && item.balanceInUsd && (
                      <p className="convert">{`$ ${formatAmountShow(item.balanceInUsd)}`}</p>
                    )}
                  </div>
                </div>
              </li>
              {selectedItem.get(item.symbol) &&
                item.tokens?.map((token) => (
                  <li
                    className="token-list-item token-list-inner-item"
                    key={`${item.chainId}_${item.symbol}`}
                    onClick={() => onViewTokenItem?.(token)}>
                    <TokenChainImageDisplay
                      tokenSrc={token.imageUrl}
                      chainSrc={token.chainImageUrl}
                      symbol={token.symbol}
                    />
                    <div className="desc">
                      <div className="info">
                        <span>{item?.label || item.symbol}</span>
                        <span>{formatAmountShow(divDecimals(token.balance, token.decimals))}</span>
                      </div>
                      <div className="amount">
                        <p>{transNetworkText(token.chainId, isMainnet)}</p>
                        {isMainnet && token.balanceInUsd && (
                          <p className="convert">{`$ ${formatAmountShow(token.balanceInUsd)}`}</p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
            </>
          ))
        )}
      </ul>
    </>
  );
}
