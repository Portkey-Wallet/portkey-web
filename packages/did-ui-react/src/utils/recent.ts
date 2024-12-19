import { ChainId } from '@portkey/types';
import { NetworkType } from '../types';

export interface IRecentItem {
  address: string;
  chainId?: ChainId;
  network: 'aelf' | string;
  networkIcon?: string;
  transferTime: number;
}

export interface IAddItemParams {
  item: IRecentItem;
  network: NetworkType;
}

export type RecentListMap = {
  [T in NetworkType]?: IRecentItem[];
};

const RECENT_LIST_KEY = 'portkey-sdk-recent-list';
const MAX_RECENT_COUNT = 100;

export const addRecentItem = (params: IAddItemParams) => {
  const { network, item: recentItem } = params;
  const { targetRecentList, recentMap } = getRecentListMap(network);
  try {
    const existingIndex = targetRecentList.findIndex((ele) => {
      return recentItem.network && recentItem.network !== 'aelf'
        ? ele.address === recentItem.address && ele.network === recentItem.network
        : ele.address === recentItem.address && ele.chainId === recentItem.chainId;
    });

    if (existingIndex !== -1) {
      const [existingItem] = targetRecentList.splice(existingIndex, 1);
      existingItem.transferTime = recentItem.transferTime;
      targetRecentList.unshift(existingItem);
    } else {
      targetRecentList.unshift(recentItem);
      targetRecentList.length > MAX_RECENT_COUNT && targetRecentList.pop();
    }

    const data = JSON.stringify({
      ...recentMap,
      [network]: targetRecentList,
    });

    localStorage.setItem(RECENT_LIST_KEY, data);
  } catch (error) {
    console.log('error', error);
  }
};

export const getRecentListMap = (
  network: NetworkType,
): { recentMap: RecentListMap; targetRecentList: IRecentItem[] } => {
  try {
    const recentMap = JSON.parse(localStorage.getItem(RECENT_LIST_KEY) || '');
    const targetList = recentMap?.[network];
    return { recentMap, targetRecentList: targetList };
  } catch (error) {
    console.log('getRecentList error', error);
    return { recentMap: {}, targetRecentList: [] };
  }
};

export const getTransformedRecentList = (network: NetworkType): IRecentItem[] => {
  const { targetRecentList } = getRecentListMap(network);
  return targetRecentList;
};
