import React from 'react';
import clsx from 'clsx';
import { Card, Image, Typography } from 'antd';
import './index.less';
import NFTImage from '../NFTImage';
import { INftCollectionItem } from '@portkey/services';
import { formatTokenAmountShowWithDecimals } from '../../utils/converter';
import CustomSvg from '../CustomSvg';
import { NFTCollectionItemShowType, NFTItemBaseExpand } from '../types/assets';

const { Text } = Typography;
export interface IProps {
  isViewAll?: boolean;
  nftItem?: INftCollectionItem;
  nftCollectionName?: string;
  nftImageUrl?: string;
  onNFTView?: (item: NFTItemBaseExpand) => void;
  onCollectionView?: () => void;
}
const NFTItem = (props: IProps) => {
  const { nftItem, isViewAll, onNFTView, onCollectionView, nftCollectionName, nftImageUrl } = props;
  return (
    <Card
      className={clsx('custom-card grid-item', { viewAll: isViewAll })}
      onClick={() => {
        console.log('wfs=== click', nftItem, onNFTView);
        if (nftItem) {
          onNFTView?.({
            ...nftItem,
            collectionName: nftCollectionName || '',
            collectionImageUrl: nftImageUrl || '',
          });
        } else {
          console.log('wfs====1');
          onCollectionView?.();
        }
      }}>
      {nftItem && (
        <div className="container">
          <NFTImage
            className={clsx(['item', nftItem.imageUrl ? 'item-img' : ''])}
            name=""
            imageUrl={nftItem.imageUrl}
            isSeed={nftItem.isSeed}
            seedType={nftItem.seedType}
            // onClick={() =>
            //   // onNFTView?.({
            //   //   ...nftItem,
            //   //   collectionName: nft.collectionName,
            //   //   collectionImageUrl: nft.imageUrl,
            //   // })
            // }
          />
          {/* <div className="mask">
              <p className="alias">{nftItem.alias}</p>
              <p className="token-id">#{nftItem.tokenId}</p>
            </div> */}
          {/* </NFTImage> */}
          <div className="text-container">
            <Text className="item-name">{nftItem.alias}</Text>
            <Text className="item-value">
              {nftItem.balance && nftItem.decimals
                ? formatTokenAmountShowWithDecimals(nftItem.balance, nftItem.decimals)
                : `#${nftItem.tokenId}`}
            </Text>
          </div>
        </div>
      )}
      {isViewAll && (
        <div className="view-all-container">
          <CustomSvg type="ArrowRightThin" />
          <div className="view-all-text">View all</div>
        </div>
      )}
    </Card>
  );
};

export default NFTItem;
