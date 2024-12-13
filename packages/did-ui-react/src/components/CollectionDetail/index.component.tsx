import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePortkey } from '../context';
import { MAINNET } from '../../constants/network';
import { addressFormat, divDecimalsStr, transNetworkText } from '../../utils/converter';
import Copy from '../Copy';
import SettingHeader from '../SettingHeader';
import './index.less';
import { ChainId, SeedTypeEnum } from '@portkey/types';
import { NFTCollectionItemShowType, NFTItemBaseExpand } from '../types/assets';
import { did, formatStr2EllipsisStr } from '../../utils';
import ThrottleButton from '../ThrottleButton';
import clsx from 'clsx';
import NFTImage from '../NFTImage';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import moment from 'moment';
import { NFT_SMALL_SIZE } from '../../constants/assets';
import CustomSvg from '../CustomSvg';
import ExpandableText from '../ExpandableText';
import { Divider } from 'antd';
import { devices } from '@portkey/utils';
import { basicAssetViewAsync } from '../context/PortkeyAssetProvider/actions';
import { AssetTabsProps } from '../AssetTabs';
import { NetworkType } from '../../types';
import NFTItem from '../NFTItem';
import useNFTMaxCount from '../../hooks/useNFTMaxCount';
export interface ICollectionItem {
  imageUrl: string;
  collectionName: string;
  itemCount: number;
  symbol: string;
  chainId: ChainId;
}
export interface CollectionDetailProps {
  collectionItem: NFTCollectionItemShowType;
  networkType: NetworkType;
  onNFTView?: (item: NFTItemBaseExpand) => void;
  onBack?: () => void;
}

export default function CollectionDetailMain({
  collectionItem,
  networkType,
  onNFTView,
  onBack,
}: CollectionDetailProps) {
  const [{ caInfo, NFTCollection, initialized }, { dispatch }] = usePortkeyAsset();
  const { symbol, chainId } = collectionItem;
  const nftMaxCount = useNFTMaxCount();
  const currentNum = useRef(0);
  const currentCollection = useMemo(() => {
    const tempCurrentCollection = NFTCollection?.list.find(
      (item) => item.symbol === symbol && item.chainId === chainId,
    );
    currentNum.current = Math.floor((tempCurrentCollection?.children.length || 0) / nftMaxCount);
    return tempCurrentCollection;
  }, [NFTCollection?.list, chainId, nftMaxCount, symbol]);
  const lastKnownScrollPosition = useRef(0);
  const ticking = useRef(false);
  const [opacity, setOpacity] = useState(0);
  const loadMoreNFT: Required<AssetTabsProps>['loadMoreNFT'] = useCallback(
    async ({ symbol, chainId, pageNum }) => {
      if (!initialized) {
        return;
      }
      const targetNFTCollection = NFTCollection?.list.find(
        (item) => item.symbol === symbol && item.chainId === chainId,
      );
      console.log('wfs=== loadMoreNFT', targetNFTCollection);
      if (!targetNFTCollection) return;

      const { skipCount, maxResultCount, totalRecordCount, children } = targetNFTCollection;
      // has cache data
      if ((pageNum + 1) * maxResultCount <= children.length) return;

      const caAddressInfos = Object.entries(caInfo ?? {})
        .map(([chainId, info]) => ({
          chainId: chainId as ChainId,
          caAddress: info.caAddress,
        }))
        .filter((info) => info.chainId === chainId);
      if (totalRecordCount === 0 || Number(totalRecordCount) >= children.length) {
        // setLoading(true);
        basicAssetViewAsync
          .setNFTItemList({
            chainId,
            symbol,
            caAddressInfos,
            skipCount,
            maxResultCount,
          })
          .then(dispatch);
        // .finally(() => setLoading(false));
      }
    },
    [NFTCollection?.list, caInfo, dispatch, initialized],
  );

  const handleScroll = useCallback(
    (event: { target: any }) => {
      lastKnownScrollPosition.current = event.target.scrollTop;
      const clientHeight = event.target.clientHeight;
      const scrollHeight = event.target.scrollHeight;
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          console.log('lastKnownScrollPosition.current is:', lastKnownScrollPosition.current);
          if (lastKnownScrollPosition.current >= (devices.isMobileDevices() ? 618 - 60 : 618)) {
            setOpacity(1);
          } else {
            setOpacity(0);
          }
          if (lastKnownScrollPosition.current + clientHeight >= scrollHeight - 5) {
            loadMoreNFT({
              symbol,
              chainId,
              pageNum: ++currentNum.current,
            });
            // currentNum.current++;
          }
          ticking.current = false;
        });
        ticking.current = true;
      }
    },
    [chainId, loadMoreNFT, symbol],
  );

  useEffect(() => {
    document.getElementsByClassName('portkey-ui-asset-wrapper')?.[0]?.addEventListener('scroll', handleScroll);
    // document.addEventListener('scroll', handleScroll);
    return () => {
      document.getElementsByClassName('portkey-ui-asset-wrapper')?.[0]?.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const renderCollectionDetailHeader = useMemo(() => {
    // eslint-disable-next-line prettier/prettier
    const {
      imageUrl: collectionImageUrl,
      collectionName,
      chainId = 'AELF',
      itemCount,
      totalRecordCount,
    } = currentCollection || {};
    return (
      <>
        <div className="img">
          {collectionImageUrl ? (
            <img src={collectionImageUrl} />
          ) : (
            <div className="img-text portkey-ui-flex-center">{collectionName?.slice(0, 1)}</div>
          )}
        </div>
        <div className="collection-name">{collectionName}</div>
        <div className="collection-name">
          {transNetworkText(chainId, networkType === 'MAINNET')} • {totalRecordCount || itemCount}{' '}
          {totalRecordCount || itemCount || 0 > 1 ? 'items' : 'item'}
        </div>
      </>
    );
  }, [currentCollection, networkType]);
  const renderNFTList = useMemo(() => {
    const { collectionName, imageUrl } = currentCollection || {};
    return (
      <div className="grid-container">
        {currentCollection?.children.map((item, index) => (
          <NFTItem
            key={index + ''}
            nftItem={item}
            onNFTView={onNFTView}
            nftCollectionName={collectionName}
            nftImageUrl={imageUrl}
          />
        ))}
      </div>
    );
  }, [currentCollection, onNFTView]);
  return (
    <div className="portkey-ui-collection-detail">
      <div className="collection-detail-body">
        <SettingHeader
          leftCallBack={onBack}
          leftElement={undefined}
          title={currentCollection?.collectionName}
          titleStyle={{ opacity, textAlign: 'center' }}
        />
        {renderCollectionDetailHeader}
        {renderNFTList}
      </div>
    </div>
  );
}
