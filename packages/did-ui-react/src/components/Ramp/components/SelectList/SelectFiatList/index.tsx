import { ReactNode, useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IRampCryptoDefault, IRampFiatItem } from '@portkey/ramp';
import CustomSvg from '../../../../CustomSvg';
import DropdownSearch from '../../../../DropdownSearch';
import { getSellFiat } from '../../../utils/api';

export interface ISelectFiatListProps {
  supportList: IRampFiatItem[];
  defaultCrypto: IRampCryptoDefault;
  title?: ReactNode;
  searchPlaceHolder?: string;
  onClose?: () => void;
  onChange?: (v: IRampFiatItem) => void;
}

export default function SelectFiatList({
  supportList,
  title,
  searchPlaceHolder,
  defaultCrypto,
  onClose,
  onChange,
}: ISelectFiatListProps) {
  const { t } = useTranslation();
  const [openDrop, setOpenDrop] = useState<boolean>(false);
  const [filterWord, setFilterWord] = useState<string>('');
  const [filterFiatList, setFilterFiatList] = useState<IRampFiatItem[]>([]);

  const getFilterFiatList = useCallback(async () => {
    const { sellFiatList } = await getSellFiat({ crypto: defaultCrypto.symbol, network: defaultCrypto.network });
    setFilterFiatList(sellFiatList);
  }, [defaultCrypto.network, defaultCrypto.symbol]);

  useEffect(() => {
    if (defaultCrypto.symbol && defaultCrypto.network) {
      getFilterFiatList();
    }
  }, [defaultCrypto.network, defaultCrypto.symbol, getFilterFiatList]);

  const fiatList: IRampFiatItem[] = useMemo(() => {
    return defaultCrypto ? filterFiatList : supportList;
  }, [defaultCrypto, filterFiatList, supportList]);

  const showFiatList = useMemo(() => {
    return filterWord === ''
      ? fiatList
      : fiatList.filter(
          (item) =>
            item.symbol.toLowerCase().includes(filterWord.toLowerCase()) ||
            item.countryName?.toLowerCase().includes(filterWord.toLowerCase()),
        );
  }, [fiatList, filterWord]);

  useEffect(() => {
    setOpenDrop(!!filterWord && !showFiatList.length);
  }, [filterWord, showFiatList]);

  const renderFiatList = useMemo(
    () => (
      <>
        {showFiatList.map((fiat) => (
          <div
            key={`${fiat.country}_${fiat.symbol}`}
            className="item fiat-item flex"
            onClick={() => {
              onChange?.(fiat);
              onClose?.();
            }}>
            <div className="flag">
              <img src={fiat.icon || ''} alt="" />
            </div>
            <div className="text">{`${fiat.countryName || ''} - ${fiat.symbol}`}</div>
          </div>
        ))}
      </>
    ),
    [onChange, onClose, showFiatList],
  );

  return (
    <div className="custom-list">
      <div className="header">
        <p>{title || 'Select'}</p>
        <CustomSvg type="Close2" onClick={onClose} />
      </div>
      <DropdownSearch
        overlayClassName="empty-dropdown"
        open={openDrop}
        value={filterWord}
        overlay={<div className="empty-tip">{t('There is no search result.')}</div>}
        inputProps={{
          onBlur: () => setOpenDrop(false),
          onChange: (e) => {
            const _value = e.target.value.replaceAll(' ', '');
            if (!_value) setOpenDrop(false);
            setFilterWord(_value);
          },
          placeholder: searchPlaceHolder || 'Search',
        }}
      />
      <div className="list">{renderFiatList}</div>
    </div>
  );
}
