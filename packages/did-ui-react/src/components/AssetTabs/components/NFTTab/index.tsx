import { Collapse, List } from 'antd';
import { NFTCollectionItemShowType, NFTItemBaseExpand } from '../../../types/assets';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { transNetworkText } from '../../../../utils/converter';
import clsx from 'clsx';
import CustomSvg from '../../../CustomSvg';
import { ChainId } from '@portkey/types';
import useNFTMaxCount from '../../../../hooks/useNFTMaxCount';
import { INftCollectionItem } from '@portkey/services';
import CheckFetchLoading from '../../../CheckFetchLoading';
import './index.less';
import NFTImage from '../../../NFTImage';
import NFTItem from '../../../NFTItem';
import { useResponsiveScreenType } from '../../../../hooks/useMedia';

export interface NFTTabProps {
  isMainnet?: boolean;
  accountNFTList?: NFTCollectionItemShowType[];
  loadMoreNFT?: (params: { symbol: string; chainId: ChainId; pageNum: number }) => void;
  onNFTView?: (item: NFTItemBaseExpand, collectionItem?: NFTCollectionItemShowType) => void;
  onCollectionView?: (collectionItem?: NFTCollectionItemShowType) => void;
  isGetNFTCollectionPending?: boolean;
}

export interface NFTTabInstance {
  refreshState: () => void;
}

const NFTTab = forwardRef(
  (
    {
      accountNFTList,
      isMainnet,
      isGetNFTCollectionPending = false,
      loadMoreNFT,
      onNFTView,
      onCollectionView,
    }: NFTTabProps,
    ref,
  ) => {
    const [openPanel, setOpenPanel] = useState<string[]>([]);
    const [nftNum, setNftNum] = useState<Record<string, number>>({});
    const [getMoreFlag, setGetMoreFlag] = useState(false);
    const screenType = useResponsiveScreenType();
    const [activeKey, setActiveKey] = useState<string | string[]>([]);

    const refreshState = useCallback(() => {
      setOpenPanel([]);
      setNftNum({});
      setGetMoreFlag(false);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        refreshState,
      }),
      [refreshState],
    );

    const maxNftNum = useNFTMaxCount();

    const getMore = useCallback(
      async (symbol: string, chainId: ChainId) => {
        if (getMoreFlag) return;
        const nftColKey = `${symbol}_${chainId}`;
        const curNftNum = nftNum[nftColKey];
        setGetMoreFlag(true);

        loadMoreNFT?.({
          symbol,
          chainId: chainId as ChainId,
          pageNum: curNftNum,
        });
        setNftNum((v) => ({ ...v, [nftColKey]: curNftNum + 1 }));
        setGetMoreFlag(false);
      },
      [getMoreFlag, loadMoreNFT, nftNum],
    );

    const handleChange = useCallback(
      (arr: string[] | string) => {
        setActiveKey(arr);
        if (isGetNFTCollectionPending) return;
        const openArr = typeof arr === 'string' ? [arr] : arr;

        openPanel.forEach((prev: string) => {
          if (!openArr.some((cur: string) => cur === prev)) {
            setNftNum((v) => ({ ...v, [prev]: 0 }));
          }
        });
        console.log(openArr, openPanel, 'wfs==== openArr,handleChange');
        openArr.forEach((cur: string) => {
          if (!openPanel.some((prev: string) => cur === prev)) {
            const curTmp = cur.split('_');

            loadMoreNFT?.({
              symbol: curTmp[0],
              chainId: curTmp[1] as ChainId,
              pageNum: 0,
            });

            setNftNum((v) => ({ ...v, [cur]: 1 }));
          }
        });
        setOpenPanel(openArr);
      },
      [isGetNFTCollectionPending, loadMoreNFT, openPanel],
    );

    const renderItem = (nft: NFTCollectionItemShowType) => {
      const nftColKey = `${nft.symbol}_${nft.chainId}`;
      console.log('nft.children.length', nft.children);
      // nft.children.length = 11;
      const totalRecordCount = Number(nft.totalRecordCount);
      const showViewAll =
        (screenType === 'small' && totalRecordCount > 8) ||
        (screenType === 'medium' && totalRecordCount > 11) ||
        (screenType === 'large' && totalRecordCount > 14);
      if (!nft.symbol) return null;
      return (
        <Collapse.Panel
          key={nftColKey}
          showArrow={false}
          style={{ borderBottom: 0 }}
          header={
            <div className="protocol">
              <div className="avatar">
                {nft.imageUrl ? <img src={nft.imageUrl} /> : nft.collectionName?.slice(0, 1)}
                {nft.displayChainImage && nft.chainImageUrl && <img className="chain-image" src={nft.chainImageUrl} />}
              </div>
              <div className="info">
                <p className="alias">{nft.collectionName}</p>
                {/* <p className="network">{transNetworkText(nft.chainId, isMainnet)}</p> */}
              </div>
              <div className="amount">{nft.itemCount}</div>
              <CustomSvg
                type="ChevronDown"
                className={clsx('rotate', { 'rotate-180': activeKey.includes(nftColKey) })}
              />
            </div>
          }>
          {Boolean(nftNum[nftColKey]) && (
            <div className={clsx('grid-container', (!nft.children?.length || !nftNum[nftColKey]) && 'empty-list')}>
              {Boolean(nftNum[nftColKey]) &&
                nft.children.map((nftItem: INftCollectionItem, index: number) => {
                  return (
                    <NFTItem
                      key={index + ''}
                      isViewAll={false}
                      nftItem={nftItem}
                      onNFTView={(v) => {
                        onNFTView?.(v, nft);
                      }}
                      nftCollectionName={nft.collectionName}
                      nftImageUrl={nft.imageUrl}
                    />
                  );
                })}
              {!!nftNum[nftColKey] && showViewAll && (
                <NFTItem
                  isViewAll
                  onCollectionView={() => {
                    console.log('wfs====2', onCollectionView);
                    onCollectionView?.(nft);
                  }}
                />
              )}
            </div>
          )}
        </Collapse.Panel>
      );
    };

    return (
      <div className="portkey-ui-nft-tab">
        {accountNFTList?.length === 0 || !accountNFTList ? (
          <CheckFetchLoading list={accountNFTList} emptyElement={<p className="empty-text">No NFTs yet</p>} />
        ) : (
          <List className="portkey-ui-nft-list">
            <List.Item style={{ cursor: isGetNFTCollectionPending ? 'not-allowed' : 'pointer' }}>
              <Collapse activeKey={openPanel} onChange={handleChange} expandIconPosition="end">
                {accountNFTList.map((item) => renderItem(item))}
              </Collapse>
            </List.Item>
          </List>
        )}
      </div>
    );
  },
);

export default NFTTab;
