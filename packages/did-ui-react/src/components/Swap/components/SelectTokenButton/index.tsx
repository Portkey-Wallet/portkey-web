import { useCallback, useMemo, useState } from 'react';
import './index.less';
import clsx from 'clsx';
import { CommonModal } from '@portkey/did-ui-react';
import { Input } from 'antd';
import { CurrencyItem } from '../CurrencyItem';
import { TCurrency } from '@portkey/types';
import { useAwakenTokenList } from '../../../../hooks/awaken/state';
import CustomSvg from '../../../CustomSvg';
import TokenImageDisplay from '../../../TokenImageDisplay';
import { formatNameWithNoUnderline, truncateString } from '../../../../utils/format';

interface ISelectTokenButtonProps {
  className?: string;
  modalTitle: string;
  token?: TCurrency;
  onTokenChange?: (token: TCurrency) => void;
}

export const SelectTokenButton = ({ className, modalTitle, token, onTokenChange }: ISelectTokenButtonProps) => {
  const [isShow, setIsShow] = useState(false);

  const onPress = useCallback(() => {
    setKeyword('');
    setIsShow(true);
  }, []);

  const { list } = useAwakenTokenList();
  const [keyword, setKeyword] = useState('');

  const filterList = useMemo(() => {
    if (keyword === '') {
      return list;
    }
    return list.filter((item) => item.symbol.toLocaleUpperCase().includes(keyword.toLocaleUpperCase()));
  }, [keyword, list]);

  const handleSelect = useCallback(
    (item: TCurrency) => {
      onTokenChange?.(item);
      setIsShow(false);
    },
    [onTokenChange],
  );

  const inputSuffix = useMemo(() => {
    if (keyword) {
      return (
        // TODO: swap svg origin: close-circle
        <CustomSvg className="swap-select-token-modal-input-close-icon" type="Close3" onClick={() => setKeyword('')} />
      );
    }

    // TODO: swap svg
    return <CustomSvg className="swap-select-token-modal-input-search-icon" type="Search2" />;
  }, [keyword]);

  return (
    <div className={clsx('swap-select-token-button-wrap', className)}>
      <div className="swap-select-token-button" onClick={onPress}>
        <div className="swap-select-token-button-image-wrap">
          <TokenImageDisplay width={25} symbol={token?.symbol} src={token?.imageUrl} />
          <TokenImageDisplay
            className="swap-select-token-button-chain-image"
            width={16}
            symbol={''}
            src={token?.chainImageUrl}
          />
        </div>
        <div className="swap-select-token-button-symbol">
          {truncateString(formatNameWithNoUnderline(token?.label || token?.symbol))}
        </div>
        {/* TODO: swap svg origin:chevron_down */}
        <CustomSvg className="swap-select-token-button-icon" type="ChevronDown2" />
      </div>

      <CommonModal
        className="swap-select-token-modal"
        maskClosable={true}
        open={isShow}
        onClose={() => {
          setIsShow(false);
        }}>
        <div className="swap-select-token-modal-wrap">
          <div className="swap-select-token-modal-title">{modalTitle}</div>

          <div className="swap-select-token-modal-input-wrap">
            <Input
              className="swap-select-token-modal-input"
              type="search"
              placeholder="Search"
              value={keyword}
              onChange={(e) => {
                const v = e.target.value.trim();
                setKeyword(v);
              }}
              suffix={inputSuffix}
            />
          </div>

          {filterList.length ? (
            <div className="swap-select-token-modal-body">
              {filterList.map((item) => (
                <CurrencyItem key={`${item.symbol}${item.chainId}`} item={item} onClick={handleSelect} />
              ))}
            </div>
          ) : (
            <div className="swap-select-token-modal-empty">No tokens available</div>
          )}
        </div>
      </CommonModal>
    </div>
  );
};
