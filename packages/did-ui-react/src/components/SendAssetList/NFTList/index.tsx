import { useCallback } from 'react';
import { IAssetNftCollection } from '@portkey/services';
import { INftInfoType } from '@portkey/types';
import { formatTokenAmountShowWithDecimals } from '../../../utils/converter';
import Loading from '../../Loading';
import NFTImage from '../../NFTImage';
import './index.less';

export interface SendNFTListProps {
  nftInfos: IAssetNftCollection[];
  noDataMessage: string;
  loading: boolean;
  isMainnet?: boolean;
  onSelect: (tokenItem: INftInfoType) => void;
}

export default function SendNFTList({
  nftInfos = [],
  noDataMessage,
  loading,
  isMainnet = false,
  onSelect,
}: SendNFTListProps) {
  const renderItem = useCallback(
    (nft: INftInfoType) => {
      return (
        <div className="nft-item flex-row-center gap-8" onClick={() => onSelect(nft)}>
          <NFTImage imageUrl={nft.imageUrl} name={nft.alias} isSeed={nft.isSeed} seedType={nft.seedType} />
          <div className="nft-item-info flex-between-center flex-1">
            <div>
              <div>{`${nft.alias} #${nft.tokenId}`}</div>
              <div className="nft-item-chain">{`${nft.displayChainName || ''} ${isMainnet ? '' : 'Testnet'}`}</div>
            </div>
            <div>{formatTokenAmountShowWithDecimals(nft.balance, nft.decimals)}</div>
          </div>
        </div>
      );
    },
    [isMainnet, onSelect],
  );
  const renderCollection = useCallback(
    (item: IAssetNftCollection) => {
      return (
        <>
          <div className="nft-collection flex-row-center gap-8" key={item.collectionName}>
            <NFTImage imageUrl={item.imageUrl} name={item.collectionName} />
            <div>{item.collectionName}</div>
          </div>
          {item.items.map((nft) => renderItem(nft))}
        </>
      );
    },
    [renderItem],
  );
  return (
    <div className="send-select-nft">
      {loading ? (
        <Loading />
      ) : nftInfos.length === 0 ? (
        <div className="no-data-message flex-center">{noDataMessage}</div>
      ) : (
        nftInfos.map((item) => renderCollection(item))
      )}
    </div>
  );
}