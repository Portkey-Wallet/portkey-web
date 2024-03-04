import { Collapse, List } from 'antd';
import { NFTCollectionItemShowType, NFTItemBaseExpand } from '../../../types/assets';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { transNetworkText } from '../../../../utils/converter';
import clsx from 'clsx';
import CustomSvg from '../../../CustomSvg';
import { ChainId } from '@portkey/types';
import useNFTMaxCount from '../../../../hooks/useNFTMaxCount';
import { INftCollectionItem } from '@portkey/services';
import CheckFetchLoading from '../../../CheckFetchLoading';
import './index.less';
import SeedBadge from '../SeedBadge';

export interface NFTTabProps {
  isMainnet?: boolean;
  accountNFTList?: NFTCollectionItemShowType[];
  loadMoreNFT?: (params: { symbol: string; chainId: ChainId; pageNum: number }) => void;
  onNFTView?: (item: NFTItemBaseExpand) => void;
  isGetNFTCollectionPending?: boolean;
}

export interface NFTTabInstance {
  refreshState: () => void;
}

const NFTTab = forwardRef(
  ({ accountNFTList, isMainnet, isGetNFTCollectionPending = false, loadMoreNFT, onNFTView }: NFTTabProps, ref) => {
    const [openPanel, setOpenPanel] = useState<string[]>([]);
    const [nftNum, setNftNum] = useState<Record<string, number>>({});
    const [getMoreFlag, setGetMoreFlag] = useState(false);

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
        if (isGetNFTCollectionPending) return;
        const openArr = typeof arr === 'string' ? [arr] : arr;

        openPanel.forEach((prev: string) => {
          if (!openArr.some((cur: string) => cur === prev)) {
            setNftNum((v) => ({ ...v, [prev]: 0 }));
          }
        });
        console.log(openArr, openPanel, 'openArr,handleChange');
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

      if (!nft.symbol) return null;
      return (
        <Collapse.Panel
          key={nftColKey}
          header={
            <div className="protocol">
              <div className="avatar">
                {nft.imageUrl ? <img src={nft.imageUrl} /> : nft.collectionName?.slice(0, 1)}
              </div>
              <div className="info">
                <p className="alias">{nft.collectionName}</p>
                <p className="network">{transNetworkText(nft.chainId, isMainnet)}</p>
              </div>
              <div className="amount">{nft.itemCount}</div>
            </div>
          }>
          <div className={clsx('list', (!nft.children?.length || !nftNum[nftColKey]) && 'empty-list')}>
            {Boolean(nftNum[nftColKey]) &&
              nft.children.map((nftItem: INftCollectionItem, index: number) => {
                const curNftNum = nftNum[nftColKey] ?? 0;
                return (
                  index < curNftNum * maxNftNum && (
                    <div
                      key={`${nft.symbol}-${nftItem.symbol}-${nftItem.chainId}`}
                      style={{
                        backgroundImage: `url('${nftItem.imageUrl}')`,
                      }}
                      className={clsx(['item', nftItem.imageUrl ? 'item-img' : ''])}
                      onClick={() =>
                        onNFTView?.({
                          ...nftItem,
                          decimals: 0,
                          collectionName: nft.collectionName,
                          collectionImageUrl: nft.imageUrl,
                        })
                      }>
                      <SeedBadge className="item-seed-type" isSeed={nftItem.isSeed} seedType={nftItem.seedType} />
                      <div className="mask">
                        <p className="alias">{nftItem.alias}</p>
                        <p className="token-id">#{nftItem.tokenId}</p>
                      </div>
                    </div>
                  )
                );
              })}
            {!!nftNum[nftColKey] && Number(nft.totalRecordCount) > nftNum[nftColKey] * maxNftNum && (
              <div
                className="load-more"
                onClick={() => {
                  getMore?.(nft.symbol, nft.chainId);
                }}>
                <CustomSvg type="Down" /> More
              </div>
            )}
          </div>
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
              <Collapse activeKey={openPanel} onChange={handleChange}>
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
