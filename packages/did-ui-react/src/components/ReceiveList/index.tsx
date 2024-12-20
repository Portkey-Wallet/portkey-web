import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import CustomSvg from '../CustomSvg';
import clsx from 'clsx';

import { ITokenSectionResponse } from '../types/assets';
import CoinImage from '../CoinImage';
import { IUserTokenItemNew } from '@portkey/services';

import './index.less';
import { ChainId } from '@portkey/types';
import { did } from '../../utils';
import { useDebounce } from '../../hooks/debounce';
import CommonInput from '../CommonInput';
import { SelectTokenType } from '../Asset/index.component';

interface IReceiveListProps {
  onBack?: () => void;
  onItemClick: (item: SelectTokenType) => void;
  tokenList: IUserTokenItemNew[];
  caAddressInfos:
    | {
        chainId: ChainId;
        caAddress: string;
      }[]
    | undefined;
}

const ReceiveList = ({ onBack, onItemClick, tokenList, caAddressInfos }: IReceiveListProps) => {
  const [currentTokenList, setCurrentTokenList] = useState(tokenList);
  const [searchVal, setSearchVal] = useState<string>('');

  const debounce = useDebounce(searchVal, 500);

  const getAllTokenList = useCallback(
    async (keyword: string) => {
      if (!caAddressInfos) return;
      const chainIdArray = caAddressInfos.map((info) => info.chainId);
      const result = await did.services.assets.getUserTokenListNew({
        chainIdArray,
        keyword,
      });
      if (!result?.items) return;
      setCurrentTokenList(filterToken(result.items));
    },
    [caAddressInfos],
  );

  useEffect(() => {
    getAllTokenList(debounce);
  }, [debounce, getAllTokenList]);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
  };

  const filterToken = (tokenList: IUserTokenItemNew[]) => {
    const filteredMap: Record<string, any> = {};

    for (const item of tokenList) {
      const { symbol, chainId } = item;

      if (symbol === 'ELF' && chainId === 'AELF') {
        filteredMap[symbol] = item;
      } else if (symbol !== 'ELF') {
        if (!filteredMap[symbol] || chainId === 'tDVW') {
          filteredMap[symbol] = item;
        }
      }
    }

    return Object.values(filteredMap);
  };

  return (
    <PortkeyStyleProvider>
      <div className={clsx('portkey-ui-received-list-wrapper')}>
        <div className="received-list-nav">
          <div className="left-icon" onClick={onBack}>
            <CustomSvg type="ArrowLeft" fillColor="var(--sds-color-icon-default-default)" />
          </div>
          <div className="received-list-header">
            <span>Select Asset to Receive</span>
          </div>
        </div>
        <div className="received-list-search">
          <div className="input-container">
            <CommonInput type="search" placeholder="Search" onChange={onInputChange} />
          </div>
        </div>
        <div className="received-list-body">
          <div
            className="nft-wrapper"
            onClick={() => {
              onItemClick({
                chainId: 'tDVV',
                symbol: 'ELF',
                decimals: 0,
                address: '',
                isNFT: true,
              });
              return;
            }}>
            <CustomSvg type="Photo" className="icon" fillColor="var(--sds-color-icon-default-default)" />
            <div className="label-wrapper">
              <span>Receive NFTs</span>
              <CustomSvg type="ChevronRight" fillColor="var(--sds-color-icon-default-default)" />
            </div>
          </div>
          <div className="token-list">
            {currentTokenList.map((item: IUserTokenItemNew) => (
              <div key={item.symbol} className="item" onClick={() => onItemClick(item)}>
                <CoinImage symbol={item.symbol} src={item.imageUrl} width={42} />
                <span>{item.symbol}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortkeyStyleProvider>
  );
};

export default ReceiveList;
