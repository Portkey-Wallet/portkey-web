import { ReactNode, useCallback, useMemo, useState } from 'react';
import { ELF_SYMBOL } from '../../constants/assets';
import CustomSvg from '../CustomSvg';
import { transNetworkText } from '../../utils/converter';
import { BaseToken } from '../types/assets';
import { NetworkType } from '../../types';
import { MAINNET } from '../../constants/network';
import TitleWrapper from '../TitleWrapper';
import AssetDropdown from '../AssetDropdown';
import './index.less';

export interface ICustomTokenListProps {
  tokenList?: BaseToken[];
  onChange?: (v: BaseToken) => void;
  onClose?: () => void;
  title?: ReactNode;
  searchPlaceHolder?: string;
  networkType?: NetworkType;
}

export default function CustomTokenList({
  onChange,
  onClose,
  title,
  searchPlaceHolder,
  tokenList,
  networkType,
}: ICustomTokenListProps) {
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);
  const [filterWord, setFilterWord] = useState<string>('');

  const renderReceiveToken = useCallback(
    (token: BaseToken) => {
      return (
        <div className="item" key={`${token.symbol}_${token.chainId}`} onClick={onChange?.bind(undefined, token)}>
          <div className="icon">
            <div className="custom">
              {token.symbol === ELF_SYMBOL ? (
                <CustomSvg className="token-logo" type="ELF" />
              ) : (
                token?.symbol?.slice(0, 1)
              )}
            </div>
          </div>
          <div className="info">
            <p className="symbol">{`${token.symbol}`}</p>
            <p className="network">{transNetworkText(token.chainId, isMainnet)}</p>
          </div>
        </div>
      );
    },
    [isMainnet, onChange],
  );

  const filterTokenList = useMemo(() => {
    if (!filterWord) return tokenList;
    const filterWordUpper = filterWord.toUpperCase().trim();
    const filterSymbol = filterWord.length < 10 ? filterWordUpper : undefined;
    const filterAddress = filterWord.length < 10 ? undefined : filterWordUpper;

    return tokenList?.filter((token) => {
      if (filterSymbol) return token.symbol.toUpperCase().includes(filterSymbol);
      if (filterAddress) return token.address.toUpperCase() === filterAddress;
    });
  }, [filterWord, tokenList]);

  return (
    <div className="portkey-ui-flex-column portkey-ui-custom-token-list">
      <TitleWrapper
        className="custom-token-header"
        leftElement={false}
        title={title || '--'}
        rightElement={<CustomSvg type="Close2" onClick={onClose} />}
      />

      <AssetDropdown placeholder={searchPlaceHolder || 'Search'} onInputChange={setFilterWord} />

      <div className="list">
        {!filterTokenList || filterTokenList.length === 0 ? (
          <div className="empty-content">
            <p className="empty-text">
              {filterWord.length === 0 ? 'There are currently no assets to send' : 'There is no search result'}
            </p>
          </div>
        ) : (
          filterTokenList.map((token: BaseToken) => {
            return renderReceiveToken(token);
          })
        )}
      </div>
    </div>
  );
}
