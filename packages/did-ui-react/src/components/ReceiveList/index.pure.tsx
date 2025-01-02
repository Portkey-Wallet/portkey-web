import React, { ChangeEvent } from 'react';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import CustomSvg from '../CustomSvg';
import clsx from 'clsx';
import CoinImage from '../CoinImage';
import CommonInput from '../CommonInput';
import Loading from '../Loading';
import './index.less';
import { IUserTokenItemResponse } from '../types/assets';

export interface IPureProps {
  onBack?: () => void;
  onInputChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onItemClick: (item: IUserTokenItemResponse & { isNFT: boolean }) => void;
  isLoading?: boolean;
  currentTokenList: IUserTokenItemResponse[];
}
export default function ReceiveListPureComponent(props: IPureProps) {
  const { onBack, onInputChange, onItemClick, isLoading, currentTokenList } = props;
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
                // chainId: 'tDVV',
                symbol: 'ELF',
                decimals: 0,
                // address: '',
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
          {isLoading ? (
            <div className="loading-container">
              <Loading width={32} height={32} />
            </div>
          ) : (
            <div className="token-list">
              {currentTokenList.map((item: IUserTokenItemResponse) => (
                <div key={item.symbol} className="item" onClick={() => onItemClick({ ...item, isNFT: false })}>
                  <CoinImage symbol={item.symbol} src={item.imageUrl} width={42} />
                  <span>{item.label || item.symbol}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortkeyStyleProvider>
  );
}
