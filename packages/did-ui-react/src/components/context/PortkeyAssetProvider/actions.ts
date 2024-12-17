import { ActivityItemType, ChainId, IBaseWalletAccount } from '@portkey/types';
import { basicActions } from '../utils';
import { DIDWallet } from '@portkey/did';
import {
  Guardian,
  GetAccountAssetsByKeywordsParams,
  IAssetItemType,
  CaAddressInfosType,
  IActivitiesApiParams,
  IAssetNftCollection,
  IAssetToken,
} from '@portkey/services';
import { did } from '../../../utils';
import { NEW_CLIENT_DEFAULT_ELF_LIST, NFT_SMALL_SIZE } from '../../../constants/assets';
import { NFTCollectionItemShowType, ITokenSectionResponse, TokenItemShowType } from '../../types/assets';
import { fetchTxFeeAsync } from '../../../request/token';
import { BaseListInfo } from '../../../types';
import { PIC_MIDDLE_SIZE } from '../../../constants';

export const PortkeyAssetActions = {
  initialized: 'INITIALIZED',
  destroy: 'DESTROY',
  setDIDWallet: 'setDIDWallet',
  setGuardianList: 'setGuardianList',
  setCAInfo: 'setCAInfo',
  setTokenList: 'setTokenList',
  setTokenListV2: 'setTokenListV2',
  setNFTCollections: 'setNFTCollections',
  setNFTItemList: 'setNFTItemList',
  setTokenPrice: 'setTokenPrice',
  setAllAssets: 'setAllAssets',
  setAllAssetsV2: 'setAllAssetsV2',
  setTxFee: 'setTxFee',
  setActivityList: 'setActivityList',
};

export type WalletInfo = {
  caHash?: string;
  caInfo?: DIDWallet<IBaseWalletAccount>['caInfo'];
  accountInfo?: DIDWallet<IBaseWalletAccount>['accountInfo'];
  managementAccount?: IBaseWalletAccount;
  guardianList?: Guardian[];
  caAddressInfos?: CaAddressInfosType;
};

export type BaseAssetProps = {
  pin?: string;
  caHash?: string;
  originChainId: ChainId;
  managerPrivateKey?: string;
  didStorageKeyName?: string;
  isLoginOnChain?: boolean;
};

export type TxFeeType = {
  [key in ChainId]?: {
    ach: number;
    crossChain: number;
    max: number;
  };
};

export interface ActivityStateMapAttributes extends BaseListInfo<ActivityItemType> {
  chainId?: string;
  symbol?: string;
  isUpdate?: boolean;
}

type Symbol_ChainId = string;

export type ActivityStateMap = {
  [key in Symbol_ChainId]: ActivityStateMapAttributes;
};

export type BalanceInfo = {
  tokenListInfo?: BaseListInfo<TokenItemShowType>;
  tokenListInfoV2?: BaseListInfo<ITokenSectionResponse> & { totalBalanceInUsd?: string };
  NFTCollection?: BaseListInfo<NFTCollectionItemShowType> & { updateRandom?: string };
  tokenPrices?: {
    tokenPriceObject: {
      [symbol: string]: number | string;
    };
  };
  allAsset?: BaseListInfo<IAssetItemType>;
  allAssetV2?: {
    nftInfos: IAssetNftCollection[];
    tokenInfos: IAssetToken[];
    totalRecordCount: number;
  };
  activityMap?: ActivityStateMap;
};

export interface AssetState extends WalletInfo, BaseAssetProps, BalanceInfo {
  initialized?: boolean;
  txFee: TxFeeType;
}

export const basicAssetView = {
  initialized: {
    type: PortkeyAssetActions['initialized'],
    actions: (initialized: boolean) => basicActions(PortkeyAssetActions['initialized'], { initialized }),
  },
  setDIDWallet: {
    type: PortkeyAssetActions['setDIDWallet'],
    actions: (walletInfo: WalletInfo) => basicActions(PortkeyAssetActions['setDIDWallet'], walletInfo),
  },
  setCAInfo: {
    type: PortkeyAssetActions['setCAInfo'],
    actions: (caInfo: WalletInfo['caInfo']) => basicActions(PortkeyAssetActions['setCAInfo'], { caInfo }),
  },
  setGuardianList: {
    type: PortkeyAssetActions['setGuardianList'],
    actions: (guardianList: Guardian[]) => basicActions(PortkeyAssetActions['setGuardianList'], { guardianList }),
  },
  destroy: {
    type: PortkeyAssetActions['destroy'],
    actions: () => basicActions(PortkeyAssetActions['destroy']),
  },
};

type BaseListParams = {
  caAddressInfos: CaAddressInfosType;
  skipCount?: number;
  maxResultCount?: number;
};

const fetchTokenList = async ({
  caAddressInfos,
  skipCount = 0,
  maxResultCount = 1000,
}: BaseListParams): Promise<any> => {
  const response = await did.services.assets.fetchAccountTokenList({
    skipCount,
    maxResultCount,
    caAddressInfos,
  });
  let data;
  // mock data for new account
  if (response.data.length === 0) {
    data = {
      skipCount,
      maxResultCount,
      list: NEW_CLIENT_DEFAULT_ELF_LIST[0].tokens,
      totalRecordCount: NEW_CLIENT_DEFAULT_ELF_LIST[0].tokens?.length || 0,
    };
  } else {
    data = { skipCount, maxResultCount, list: response.data, totalRecordCount: response.totalRecordCount };
  }
  return basicActions(PortkeyAssetActions['setTokenList'], { tokenListInfo: data });
};

const fetchTokenListV2 = async ({
  caAddressInfos,
  skipCount = 0,
  maxResultCount = 1000,
}: BaseListParams): Promise<any> => {
  const response = await did.services.assets.fetchAccountTokenListV2({
    skipCount,
    maxResultCount,
    caAddressInfos,
  });
  let data;
  // mock data for new account
  if (response.data.length === 0) {
    data = {
      skipCount,
      maxResultCount,
      list: NEW_CLIENT_DEFAULT_ELF_LIST[0].tokens,
      totalRecordCount: NEW_CLIENT_DEFAULT_ELF_LIST[0].tokens?.length || 0,
      totalBalanceInUsd: '0',
    };
  } else {
    data = {
      skipCount,
      maxResultCount,
      list: response.data,
      totalRecordCount: response.totalRecordCount,
      totalBalanceInUsd: response.totalBalanceInUsd,
    };
  }
  return basicActions(PortkeyAssetActions['setTokenListV2'], { tokenListInfoV2: data });
};

const fetchNFTCollections = async ({
  caAddressInfos,
  maxNFTCount,
  skipCount = 0,
  maxResultCount = 1000,
}: BaseListParams & { maxNFTCount: number }) => {
  const response = await did.services.assets.fetchAccountNftCollectionList({
    caAddressInfos,
    skipCount,
    maxResultCount,
    width: NFT_SMALL_SIZE,
    height: -1,
  });
  return basicActions(PortkeyAssetActions['setNFTCollections'], {
    list: response.data,
    totalRecordCount: response.totalRecordCount,
    skipCount,
    maxResultCount,
    maxNFTCount,
  });
};

const fetchNFTItemList = async ({
  chainId,
  symbol,
  caAddressInfos,
  skipCount = 0,
  maxResultCount = 1000,
}: BaseListParams & { symbol: string; chainId: ChainId }) => {
  const response = await did.services.assets.fetchAccountNftCollectionItemList({
    symbol,
    caAddressInfos,
    skipCount,
    maxResultCount,
    width: NFT_SMALL_SIZE,
    height: -1,
  });
  return basicActions(PortkeyAssetActions['setNFTItemList'], {
    symbol,
    chainId,
    list: response.data,
    totalRecordCount: response.totalRecordCount,
    skipCount,
  });
};

const fetchTokenPrices = async (params: { symbols: string[] }) => {
  const response = await did.services.assets.fetchTokenPrice(params);
  return basicActions(PortkeyAssetActions['setTokenPrice'], { list: response.items });
};

const fetchAllAsset = async ({
  width = NFT_SMALL_SIZE,
  height = -1,
  keyword = '',
  skipCount = 0,
  maxResultCount = 1000,
  caAddressInfos,
}: Partial<Omit<GetAccountAssetsByKeywordsParams, 'caAddressInfos'>> & {
  caAddressInfos: GetAccountAssetsByKeywordsParams['caAddressInfos'];
}) => {
  const response = await did.services.assets.getAccountAssetsByKeywords({
    width,
    height,
    keyword,
    skipCount,
    maxResultCount,
    caAddressInfos,
  });
  return basicActions(PortkeyAssetActions['setAllAssets'], {
    list: response.data,
    totalRecordCount: response.totalRecordCount,
    skipCount,
    maxResultCount,
  });
};

const fetchAllAssetV2 = async ({
  width = NFT_SMALL_SIZE,
  height = -1,
  keyword = '',
  skipCount = 0,
  maxResultCount = 1000,
  caAddressInfos,
}: Partial<Omit<GetAccountAssetsByKeywordsParams, 'caAddressInfos'>> & {
  caAddressInfos: GetAccountAssetsByKeywordsParams['caAddressInfos'];
}) => {
  const response = await did.services.assets.getAccountAssetsByKeywordsV2({
    width,
    height,
    keyword,
    skipCount,
    maxResultCount,
    caAddressInfos,
  });
  return basicActions(PortkeyAssetActions['setAllAssets'], {
    nftInfos: response.nftInfos,
    tokenInfos: response.tokenInfos,
    totalRecordCount: response.totalRecordCount,
    skipCount,
    maxResultCount,
  });
};

const fetchTxFee = async (chainIds: ChainId[]) => {
  const txFee = await fetchTxFeeAsync(chainIds);
  return basicActions(PortkeyAssetActions['setTxFee'], { txFee });
};

const fetchActivityList = async ({
  isUpdate,
  maxResultCount,
  skipCount,
  chainId,
  symbol,
  caAddressInfos,
  managerAddresses,
  transactionTypes,
}: Omit<IActivitiesApiParams, 'caAddresses'> & { isUpdate?: boolean }) => {
  const response = await did.services.activity.getActivityList({
    width: PIC_MIDDLE_SIZE,
    height: -1,
    maxResultCount,
    skipCount,
    caAddressInfos,
    managerAddresses,
    transactionTypes,
    chainId,
    symbol,
  });
  const payload: ActivityStateMapAttributes = {
    list: response.data,
    totalRecordCount: response.totalRecordCount,
    maxResultCount: maxResultCount,
    skipCount,
    chainId,
    symbol,
    isUpdate,
  };
  return basicActions<string, typeof payload>(PortkeyAssetActions['setActivityList'], payload);
};

export const basicAssetViewAsync = {
  setTokenList: fetchTokenList,
  setTokenListV2: fetchTokenListV2,
  setNFTCollections: fetchNFTCollections,
  setNFTItemList: fetchNFTItemList,
  setTokenPrices: fetchTokenPrices,
  setAllAssetInfo: fetchAllAsset,
  setAllAssetInfoV2: fetchAllAssetV2,
  setTxFee: fetchTxFee,
  setActivityList: fetchActivityList,
};
