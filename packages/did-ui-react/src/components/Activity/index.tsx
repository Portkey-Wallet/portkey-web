import { ActivityItemType, ChainId } from '@portkey/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { getCurrentActivityMapKey } from './utils';
import { handleErrorMessage, setLoading } from '../../utils';
import ActivityList from '../ActivityList';
import { PAGESIZE_10 } from '../../constants';
import { getSkipCount } from '../context/utils';
import { PaginationPage } from '../../types';
import { useThrottleFirstEffect } from '../../hooks/throttle';
import { usePortkey } from '../context';
import { ActivityStateMapAttributes, basicAssetViewAsync } from '../context/PortkeyAssetProvider/actions';
import { usePortkeyAssetDispatch } from '../context/PortkeyAssetProvider/hooks';
import CheckFetchLoading from '../CheckFetchLoading';
import './index.less';
import singleMessage from '../CustomAnt/message';
import CustomActivityModal from '../CustomActivityModal';

export interface ActivityProps {
  chainId?: ChainId;
  symbol?: string;
  onDataInit?: () => void;
  onDataInitEnd?: () => void;
  onViewActivityItem?: (item: ActivityItemType) => void;
}

export enum EmptyTipMessage {
  NO_TRANSACTIONS = 'You have no transactions',
  NETWORK_NO_TRANSACTIONS = 'No transaction records accessible from the current custom network',
}

export default function Activity({ chainId, symbol, onDataInit, onDataInitEnd }: ActivityProps) {
  const [isActivityDetailModalShow, setIsActivityDetailModalShow] = useState(false);
  const [selectedTransaction, setSelectionTransaction] = useState<ActivityItemType>();
  const [{ activityMap, caInfo }] = usePortkeyAsset();
  const [{ chainType, networkType }] = usePortkey();
  const dispatch = usePortkeyAssetDispatch();

  const currentActivity: ActivityStateMapAttributes | undefined =
    activityMap?.[getCurrentActivityMapKey(chainId, symbol)];
  const activityList = useMemo(() => currentActivity?.list, [currentActivity?.list]);
  const activityTotal = useMemo(() => currentActivity?.totalRecordCount ?? 0, [currentActivity?.totalRecordCount]);
  const [pending, setPending] = useState<boolean>();

  const caAddressInfos = useMemo(() => {
    if (!caInfo) return;
    return Object.entries(caInfo ?? {}).map(([chainId, info]) => ({
      chainId: chainId as ChainId,
      caAddress: info.caAddress,
    }));
  }, [caInfo]);

  const [, setPageState] = useState<PaginationPage>({
    pageSize: PAGESIZE_10,
    page: 1,
  });

  const getList = useCallback(
    async (page = 1, pageSize = PAGESIZE_10, isUpdate?: boolean) => {
      if (!caAddressInfos) return;

      try {
        setLoading(true);
        const skipCount = getSkipCount(pageSize, page - 1);
        if (skipCount > activityTotal) return;
        const _caAddressInfos = chainId ? caAddressInfos.filter((item) => item.chainId === chainId) : caAddressInfos;
        const res = await basicAssetViewAsync.setActivityList({
          maxResultCount: pageSize,
          skipCount,
          isUpdate,
          caAddressInfos: _caAddressInfos,
          chainId,
          symbol,
        });
        dispatch(res);
        setPending(false);
      } catch (error) {
        singleMessage.error(handleErrorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [caAddressInfos, chainId, activityTotal, symbol],
  );

  useEffect(() => {
    if (chainId) {
      getList();
    }
  }, [chainId]);

  const isOnce = useRef<boolean>();

  // init State
  useThrottleFirstEffect(() => {
    if (activityList?.length) return;
    if (!caAddressInfos || isOnce.current) return;
    onDataInit?.();
    getList().then(() => {
      onDataInitEnd?.();
      isOnce.current = true;
    });
  }, [caAddressInfos, getList]);

  const loadMoreActivities = useCallback(async () => {
    if (pending) return;
    setPending(true);
    setPageState((v) => {
      const page = ++v.page;
      getList(page, v.pageSize);
      return { ...v, page };
    });
  }, [pending, getList]);

  const isHasMore = useMemo(() => {
    if (!activityList) return true;
    return !activityList?.slice(-1)[0] && activityTotal !== 0;
  }, [activityList, activityTotal]);

  return (
    <div className="portkey-ui-activity-wrapper">
      <CustomActivityModal
        open={isActivityDetailModalShow}
        caAddressInfos={caAddressInfos}
        transactionDetail={selectedTransaction}
        onCancel={() => {
          setIsActivityDetailModalShow(false);
        }}
      />

      {activityTotal || currentActivity?.list ? (
        <ActivityList
          networkType={networkType}
          chainType={chainType}
          data={currentActivity?.list?.filter((item) => !!item)}
          chainId={chainId}
          hasMore={isHasMore}
          loadMore={loadMoreActivities}
          onSelect={(item: ActivityItemType) => {
            setSelectionTransaction(item);
            setIsActivityDetailModalShow(true);
          }}
        />
      ) : (
        <CheckFetchLoading
          list={currentActivity?.list}
          emptyElement={<p className="empty">{EmptyTipMessage.NO_TRANSACTIONS}</p>}
        />
      )}
    </div>
  );
}
