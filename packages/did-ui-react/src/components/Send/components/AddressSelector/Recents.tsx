import { useCallback, useMemo, useRef, useState } from 'react';
import { ChainId } from '@portkey/types';
import { IClickAddressProps } from '../../../types/assets';
import { basicSendAction } from '../../../context/PortkeySendProvider/actions';
import { usePortkeyAsset } from '../../../context/PortkeyAssetProvider';
import { useThrottleEffect } from '../../../../hooks/throttle';
import { usePortkeySendDispatch } from '../../../context/PortkeySendProvider/hooks';
import { handleErrorMessage } from '../../../../utils';
import { usePortkeySend } from '../../../context/PortkeySendProvider';
import RecentItem from './RecentItem';
import { MAINNET } from '../../../../constants/network';
import LoadingMore from '../../../LoadingMore';
import { NetworkType, PaginationPage } from '../../../../types';
import { getSkipCount } from '../../../context/utils';
import singleMessage from '../../../CustomAnt/message';

const PAGESIZE = 10;

export default function Recents({
  networkType,
  onChange,
  chainId,
}: {
  networkType: NetworkType;
  onChange: (account: IClickAddressProps) => void;
  chainId: ChainId;
}) {
  const [, setPageState] = useState<PaginationPage>({
    pageSize: PAGESIZE,
    page: 1,
  });
  const [{ caAddressInfos }] = usePortkeyAsset();
  const [{ recentTx }] = usePortkeySend();
  const dispatch = usePortkeySendDispatch();
  const userAddressInfo = useMemo(
    () => caAddressInfos?.filter((item) => item.chainId === chainId),
    [caAddressInfos, chainId],
  );
  const currentRecentList = useMemo(() => recentTx?.list || [], [recentTx]);
  const [pending, setPending] = useState<boolean>();

  const getList = useCallback(
    (page = 1, pageSize = PAGESIZE, isUpdate?: boolean) => {
      if (!userAddressInfo) return;

      try {
        const skipCount = getSkipCount(pageSize, page - 1);
        if (skipCount > (recentTx?.totalRecordCount || 0)) return;
        basicSendAction
          .setRecentList({
            skipCount,
            isUpdate,
            caAddressInfos: userAddressInfo,
            pageSize,
          })
          .then((res) => {
            dispatch(res);
            setPending(false);
          });
      } catch (error) {
        singleMessage.error(handleErrorMessage(error));
      } finally {
        // setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userAddressInfo, recentTx?.totalRecordCount],
  );

  const isOnce = useRef<boolean>();

  // init State
  useThrottleEffect(() => {
    if (!userAddressInfo || isOnce.current) return;
    getList();
    isOnce.current = true;
  }, [userAddressInfo, getList]);

  const isHasMore = useMemo(() => {
    return !currentRecentList.slice(-1)[0] && recentTx?.totalRecordCount !== 0;
  }, [currentRecentList, recentTx?.totalRecordCount]);

  const recentTxDomList = useMemo(() => {
    return recentTx?.list
      .filter((item) => !!item)
      .map((item, index) => (
        <RecentItem isMainnet={networkType === MAINNET} item={item} key={index} onClick={onChange} />
      ));
  }, [networkType, onChange, recentTx?.list]);

  return (
    <div className="portkey-ui-send-recents">
      {recentTxDomList}
      {currentRecentList.length > 0 && (
        <LoadingMore
          className="loading"
          hasMore={isHasMore}
          loadMore={async () => {
            if (pending) return;
            setPending(true);
            setPageState((v) => {
              const page = ++v.page;
              getList(page, v.pageSize);
              return { ...v, page };
            });
          }}
        />
      )}
      {currentRecentList.length === 0 && <p className="no-data">There is no recents</p>}
    </div>
  );
}
