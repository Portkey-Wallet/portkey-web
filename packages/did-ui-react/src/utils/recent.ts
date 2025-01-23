import { ChainId } from '@portkey/types';
import { NetworkType } from '../types';
import { getAelfAddress } from './aelf';
import { did } from '../..';
import { TSupportConfigMap } from '@portkey/services';

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

export const getFilteredRecentList = async ({
  network,
  fromChainId,
  isFt,
  tokenId,
  myAddress,
}: {
  network: NetworkType;
  fromChainId: ChainId;
  tokenId: string;
  isFt: boolean;
  myAddress: string;
}): Promise<IRecentItem[]> => {
  const { targetRecentList } = getRecentListMap(network);

  const supportedNetworkConfig = await getSupportedConfig();
  if (!supportedNetworkConfig) return [];

  // aelf is OK, others need check
  const result = targetRecentList.filter((ele) => {
    // itself
    if (ele.network === 'aelf' && fromChainId === ele.chainId && getAelfAddress(ele.address) === myAddress) {
      return false;
    }

    if (ele.network === 'aelf') return true;
    // nft just for aelf chain
    if (!isFt) return ele.network === 'aelf' && !!ele.chainId;

    return checkIsSupportTargetChain({ supportedNetworkConfig, fromChainId, symbol: tokenId, network: ele.network });
  });

  return result || [];
};

export const getSupportedConfig = async () => {
  try {
    const { data } = await did.services.send.getSupportedTransferConfig();
    console.log('getSupportedConfig result', data);
    return data;
  } catch (error) {
    console.log('err', error);
  }
};

const checkIsSupportTargetChain = ({
  supportedNetworkConfig,
  fromChainId,
  symbol,
  network,
}: {
  supportedNetworkConfig: TSupportConfigMap;
  fromChainId: ChainId;
  symbol: string;
  network: string;
}) => {
  return supportedNetworkConfig?.[fromChainId]?.[symbol]?.find((ele) => ele.network === network);
};
