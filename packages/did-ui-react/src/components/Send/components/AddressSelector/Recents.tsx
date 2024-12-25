import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChainId } from '@portkey/types';
import { IClickAddressProps } from '../../../types/assets';
import { usePortkeyAsset } from '../../../context/PortkeyAssetProvider';
import { usePortkeySendDispatch } from '../../../context/PortkeySendProvider/hooks';
import { usePortkeySend } from '../../../context/PortkeySendProvider';
import RecentItem from './RecentItem';
import { MAINNET } from '../../../../constants/network';
import { NetworkType, PaginationPage } from '../../../../types';
import { getTransformedRecentList, IRecentItem } from '../../../../utils/recent';
import { getAelfAddress } from '../../../../utils';
import MyAddress from './MyAddress';

export default function Recents({
  networkType,
  onChange,
  chainId,
}: {
  networkType: NetworkType;
  onChange: (account: IClickAddressProps) => void;
  chainId: ChainId;
}) {
  const [{ caAddressInfos }] = usePortkeyAsset();

  const [currentRecentList, setCurrentRecentList] = useState<IRecentItem[]>([]);

  useEffect(() => {
    const _recentList = getTransformedRecentList(networkType);
    setCurrentRecentList(_recentList);
  }, [networkType]);

  const recentTxDomList = useMemo(() => {
    return currentRecentList
      ?.filter((item) => !!item)
      .map((item, index) => {
        if (getAelfAddress(item.address) === caAddressInfos?.[0]?.caAddress) {
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
