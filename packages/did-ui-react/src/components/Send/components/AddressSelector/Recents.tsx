import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChainId } from '@portkey/types';
import { IClickAddressProps } from '../../../types/assets';
import { usePortkeyAsset } from '../../../context/PortkeyAssetProvider';
import RecentItem from './RecentItem';
import { MAINNET } from '../../../../constants/network';
import { NetworkType } from '../../../../types';
import { getFilteredRecentList, IRecentItem } from '../../../../utils/recent';
import { getAelfAddress, getChainIdByAddress } from '../../../../utils';
import MyAddress from './MyAddress';

export default function Recents({
  networkType,
  onChange,
  chainId,
  tokenId,
  isFt,
}: {
  networkType: NetworkType;
  onChange: (account: IClickAddressProps) => void;
  chainId: ChainId;
  tokenId: string;
  isFt: boolean;
}) {
  const [{ caAddressInfos }] = usePortkeyAsset();
  const [currentRecentList, setCurrentRecentList] = useState<IRecentItem[]>([]);

  const initList = useCallback(async () => {
    const _recentList = await getFilteredRecentList({
      network: networkType,
      fromChainId: chainId,
      tokenId,
      isFt,
      myAddress: caAddressInfos?.[0]?.caAddress || '',
    });
    setCurrentRecentList(_recentList);
  }, [caAddressInfos, chainId, isFt, networkType, tokenId]);

  useEffect(() => {
    initList();
  }, [caAddressInfos, chainId, initList, isFt, networkType, tokenId]);

  const recentTxDomList = useMemo(() => {
    return currentRecentList
      ?.filter((item) => !!item)
      .map((item, index) => {
        if (
          getAelfAddress(item.address) === caAddressInfos?.[0]?.caAddress &&
          getChainIdByAddress(item.address) === caAddressInfos?.[0].chainId
        ) {
          return (
            <MyAddress key={index} chainId={item.chainId || 'AELF'} networkType={networkType} onClick={onChange} />
          );
        } else {
          return (
            <RecentItem
              isMainnet={networkType === MAINNET}
              item={item as unknown as IRecentItem}
              key={index}
              onClick={onChange}
            />
          );
        }
      });
  }, [caAddressInfos, currentRecentList, networkType, onChange]);

  return (
    <div className="portkey-ui-send-recents">
      {recentTxDomList}
      {currentRecentList?.length > 0 && <div style={{ height: 20, width: '100%' }}></div>}
      {currentRecentList?.length === 0 && <p className="no-data">There is no recents</p>}
    </div>
  );
}
