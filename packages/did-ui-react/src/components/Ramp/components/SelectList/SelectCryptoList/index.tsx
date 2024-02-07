import CustomSvg from '../../../../../components/CustomSvg';
import DropdownSearch from '../../../../../components/DropdownSearch';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../index.less';
import { IRampCryptoItem } from '@portkey/ramp';
import { MAINNET } from '../../../../../constants/network';
import { NetworkType } from '../../../../../types';
import { transNetworkText } from '../../../../../utils/converter';

export interface ISelectCryptoListProps {
  networkType: NetworkType;
  supportList: IRampCryptoItem[];
  title?: ReactNode;
  searchPlaceHolder?: string;
  onClose?: () => void;
  onChange?: (v: IRampCryptoItem) => void;
}

export default function SelectCryptoList({
  networkType,
  supportList,
  title,
  searchPlaceHolder,
  onClose,
  onChange,
}: ISelectCryptoListProps) {
  const { t } = useTranslation();
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);
  const [openDrop, setOpenDrop] = useState<boolean>(false);
  const [filterWord, setFilterWord] = useState<string>('');

  const showCryptoList = useMemo(() => {
    return filterWord === '' ? supportList : supportList.filter((item) => filterWord === item.symbol);
  }, [filterWord, supportList]);

  useEffect(() => {
    setOpenDrop(!!filterWord && !showCryptoList.length);
  }, [filterWord, showCryptoList.length]);

  const renderCryptoList = useMemo(
    () => (
      <>
        {showCryptoList.map((crypto) => (
          <div
            key={crypto.symbol}
            className="item token-item flex"
            onClick={() => {
              onChange?.(crypto);
              onClose?.();
            }}>
            {!!crypto.icon && (
              <div
                className="token-item-image"
                style={{
                  backgroundImage: `url(${crypto.icon})`,
                }}
              />
            )}
            {!crypto.icon && <CustomSvg type="AelfTestnet" />}
            <div className="flex-column text">
              <div>{crypto.symbol}</div>
              <div className="chain">{transNetworkText(crypto.chainId, !isMainnet)}</div>
            </div>
          </div>
        ))}
      </>
    ),
    [isMainnet, onChange, onClose, showCryptoList],
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
      <div className="list">{renderCryptoList}</div>
    </div>
  );
}
