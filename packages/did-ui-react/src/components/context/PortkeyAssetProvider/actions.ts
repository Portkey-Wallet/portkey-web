import { ChainId, IBaseWalletAccount } from '@portkey/types';
import { basicActions } from '../utils';
import { DIDWallet } from '@portkey/did';
import { Guardian } from '@portkey/services';
import { did } from '../../../utils';
import { NEW_CLIENT_DEFAULT_ELF_LIST, NFT_SMALL_SIZE } from '../../../constants/assets';
import { NFTCollectionItemShowType, TokenItemShowType } from '../../types/assets';

export const PortkeyAssetActions = {
  initialized: 'INITIALIZED',
  destroy: 'DESTROY',
  setDIDWallet: 'setDIDWallet',
  setGuardianList: 'setGuardianList',
  setCAInfo: 'setCAInfo',
  setTokenList: 'setTokenList',
  setNFTCollections: 'setNFTCollections',
  setNFTItem: 'setNFTItem',
  setTokenPrice: 'setTokenPrice',
};
type WalletInfo = {
  caInfo: DIDWallet<IBaseWalletAccount>['caInfo'];
  accountInfo: DIDWallet<IBaseWalletAccount>['accountInfo'];
  managementAccount?: IBaseWalletAccount;
};

export type BaseAssetProps = {
  initialized?: boolean;
  pin?: string;
  caHash?: string;
  originChainId: ChainId;
  managerPrivateKey?: string;
  didStorageKeyName?: string;
  guardianList?: Guardian[];
};

export type BaseListInfo<T> = {
  list: T[];
  skipCount: number;
  maxResultCount: number;
  totalRecordCount: number;
};

export type BalanceInfo = {
  tokenListInfo?: BaseListInfo<TokenItemShowType>;
  NFTCollection?: BaseListInfo<NFTCollectionItemShowType> & { updateRandom?: string };
  tokenPrices?: {
    tokenPriceObject: {
      [symbol: string]: number | string;
    };
  };
};

export interface AssetState extends WalletInfo, BaseAssetProps, BalanceInfo {}

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
  caAddressInfos: { chainId: ChainId; caAddress: string }[];
  skipCount?: number;
  maxResultCount?: number;
};

const fetchTokenList = async ({
  caAddressInfos,
  skipCount = 0,
  maxResultCount = 1000,
}: BaseListParams): Promise<any> => {
  const response = await did.assetsServices.fetchAccountTokenList({
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
      list: NEW_CLIENT_DEFAULT_ELF_LIST,
      totalRecordCount: NEW_CLIENT_DEFAULT_ELF_LIST.length,
    };
  } else {
    data = { skipCount, maxResultCount, list: response.data, totalRecordCount: response.totalRecordCount };
  }
  return basicActions(PortkeyAssetActions['setTokenList'], { tokenListInfo: data });
};

const fetchNFTCollections = async ({
  caAddressInfos,
  maxNFTCount,
  skipCount = 0,
  maxResultCount = 1000,
}: BaseListParams & { maxNFTCount: number }) => {
  const response = await did.assetsServices.fetchAccountNftCollectionList({
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

const fetchNFTItem = async ({
  chainId,
  symbol,
  caAddressInfos,
  skipCount = 0,
  maxResultCount = 1000,
}: BaseListParams & { symbol: string; chainId: ChainId }) => {
  const response = await did.assetsServices.fetchAccountNftCollectionItemList({
    symbol,
    caAddressInfos,
    skipCount,
    maxResultCount,
    width: NFT_SMALL_SIZE,
    height: -1,
  });
  return basicActions(PortkeyAssetActions['setNFTItem'], {
    symbol,
    chainId,
    list: response.data,
    totalRecordCount: response.totalRecordCount,
    skipCount,
  });
};

const fetchTokenPrices = async (params: { symbols: string[] }) => {
  const response = await did.assetsServices.fetchTokenPrice(params);
  return basicActions(PortkeyAssetActions['setTokenPrice'], { list: response.items });
};

export const basicAssetViewAsync = {
  setTokenList: fetchTokenList,
  setNFTCollections: fetchNFTCollections,
  setNFTItem: fetchNFTItem,
  setTokenPrices: fetchTokenPrices,
};
