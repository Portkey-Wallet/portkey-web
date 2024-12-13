import AssetCard from '../AssetCard';
import { usePortkey } from '../context';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import AssetTabs, { AssetTabsProps } from '../AssetTabs';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MAINNET } from '../../constants/network';
import { basicAssetViewAsync } from '../context/PortkeyAssetProvider/actions';
import { ZERO } from '../../constants/misc';
import {
  BalanceTab,
  BaseToken,
  IFaucetConfig,
  NFTCollectionItemShowType,
  NFTItemBaseExpand,
  TokenItemShowType,
  TokenType,
} from '../types/assets';
import { formatAmountShow } from '../../utils/converter';
import CustomTokenModal from '../CustomTokenModal';
import { ActivityItemType, ChainId } from '@portkey/types';
import { IAssetItemType, IUserTokenItemNew } from '@portkey/services';
import { ELF_SYMBOL } from '../../constants/assets';
import useNFTMaxCount from '../../hooks/useNFTMaxCount';
import CustomAssetModal from '../CustomAssetModal';
import { PortkeyOverviewProvider } from '../context/PortkeyOverviewProvider';
import { useFaucet } from '../../hooks/useFaucet';
import singleMessage from '../CustomAnt/message';
import { PAGESIZE_10, loginOptTip } from '../../constants';
import { loadingTip } from '../../utils/loadingTip';
import { getCurrentActivityMapKey } from '../Activity/utils';

export interface AssetOverviewProps {
  allToken?: IUserTokenItemNew[];
  isShowRamp?: boolean;
  backIcon?: ReactNode;
  faucet?: IFaucetConfig;
  isLoginOnChain?: boolean;
  onAvatarClick?: () => void;
  onReceive?: (selectToken: BaseToken) => void;
  onBuy?: (selectToken: BaseToken) => void;
  onBack?: () => void;
  onDataInit?: () => void;
  onDataInitEnd?: () => void;
  onSend?: (selectToken: IAssetItemType, type: TokenType) => void;
  onViewActivityItem?: (item: ActivityItemType) => void;
  onViewTokenItem?: (v: TokenItemShowType) => void;
  onNFTView?: (item: NFTItemBaseExpand, collectionItem?: NFTCollectionItemShowType) => void;
  onCollectionView?: (collectionItem?: NFTCollectionItemShowType) => void;
}

export function AssetOverviewContent({
  allToken,
  isShowRamp = true,
  faucet,
  backIcon = <></>,
  isLoginOnChain = true,
  onAvatarClick,
  onBuy,
  onSend,
  onBack,
  onNFTView,
  onCollectionView,
  onReceive,
  onViewTokenItem,
  onDataInit,
  onDataInitEnd,
  onViewActivityItem,
}: AssetOverviewProps) {
  const [{ networkType }] = usePortkey();
  const [{ accountInfo, tokenListInfo, caInfo, NFTCollection, activityMap }, { dispatch }] = usePortkeyAsset();
  console.log('tokenListInfo', tokenListInfo);
  const [accountBalanceUSD, setAccountBalanceUSD] = useState<string>();
  const [tokenList, setTokenList] = useState<TokenItemShowType[]>();

  const [tokenOpen, setTokenOpen] = useState(false);
  const [assetOpen, setAssetOpen] = useState(false);

  const maxNftNum = useNFTMaxCount();

  const caAddressInfos = useMemo(() => {
    if (!caInfo) return;
    return Object.entries(caInfo ?? {}).map(([chainId, info]) => ({
      chainId: chainId as ChainId,
      caAddress: info.caAddress,
    }));
  }, [caInfo]);

  const onFaucet = useFaucet(faucet);

  const loadMoreNFT: Required<AssetTabsProps>['loadMoreNFT'] = useCallback(
    async ({ symbol, chainId, pageNum }) => {
      const targetNFTCollection = NFTCollection?.list.find(
        (item) => item.symbol === symbol && item.chainId === chainId,
      );
      console.log('wfs=== loadMoreNFT', targetNFTCollection);
      if (!targetNFTCollection) return;

      const { skipCount, maxResultCount, totalRecordCount, children } = targetNFTCollection;
      // has cache data
      if ((pageNum + 1) * maxResultCount <= children.length) return;

      const caAddressInfos = Object.entries(caInfo ?? {})
        .map(([chainId, info]) => ({
          chainId: chainId as ChainId,
          caAddress: info.caAddress,
        }))
        .filter((info) => info.chainId === chainId);
      if (totalRecordCount === 0 || Number(totalRecordCount) >= children.length) {
        // setLoading(true);
        basicAssetViewAsync
          .setNFTItemList({
            chainId,
            symbol,
            caAddressInfos,
            skipCount,
            maxResultCount,
          })
          .then(dispatch);
        // .finally(() => setLoading(false));
      }
    },
    [NFTCollection?.list, caInfo, dispatch],
  );
  // get Token price
  // useEffect(() => {
  //   const symbols = tokenListInfo?.list.map((tokenInfo) => tokenInfo.symbol);
  //   if (!symbols) return;
  //   basicAssetViewAsync.setTokenPrices({ symbols }).then(dispatch);
  // }, [tokenListInfo, dispatch]);

  // Calculate the user's total balance
  useEffect(() => {
    if (networkType !== MAINNET) return;
    // if (!tokenPrices?.tokenPriceObject) return;
    if (!tokenListInfo?.list) return;
    // const tokenList = tokenListInfo?.list.map((token) => ({
    //   ...token,
    //   balanceInUsd: ZERO.plus(divDecimals(token.balance ?? 0, token.decimals))
    //     .times(tokenPrices.tokenPriceObject[token.symbol])
    //     .toString(),
    // }));
    setTokenList(tokenListInfo.list);

    const totalBalanceInUSD = tokenListInfo.list.reduce((pre, cur) => {
      // Dealing with the problem of balanceInUsd === ''
      return pre.plus(cur.balanceInUsd ? cur.balanceInUsd : ZERO);
    }, ZERO);

    setAccountBalanceUSD(formatAmountShow(totalBalanceInUSD, 2));
  }, [networkType, tokenListInfo?.list]);

  const initActivityRef = useRef(false);

  const initActivity = useCallback(() => {
    if (activityMap?.[getCurrentActivityMapKey(undefined, undefined)]?.list.length) {
      return;
    }
    if (!caAddressInfos) return;
    if (initActivityRef.current) return;

    onDataInit?.();
    initActivityRef.current = true;
    basicAssetViewAsync
      .setActivityList({
        maxResultCount: PAGESIZE_10,
        caAddressInfos,
        skipCount: 0,
      })
      .then(dispatch)
      .catch((e) => {
        initActivityRef.current = false;
      });
    onDataInitEnd?.();
  }, [activityMap, caAddressInfos, dispatch, onDataInit, onDataInitEnd]);

  useEffect(() => {
    initActivity();
  }, [initActivity]);

  const allTokenList = useMemo(() => allToken?.map((tokenItem) => tokenItem), [allToken]);

  const supportToken = useMemo(() => {
    if (Array.isArray(allTokenList) && allTokenList?.length > 0) {
      return allTokenList?.filter((token) => token.chainId === 'AELF' && token.symbol === ELF_SYMBOL);
    }
    return tokenList?.filter((token) => token.chainId === 'AELF' && token.symbol === ELF_SYMBOL);
  }, [allTokenList, tokenList]);

  const [isGetNFTCollectionPending, setIsGetNFTCollection] = useState<boolean>();
  return (
    <div className="portkey-ui-asset-overview">
      <AssetCard
        isShowRamp={isShowRamp}
        isShowFaucet={Boolean(faucet?.faucetUrl || faucet?.faucetContractAddress)}
        networkType={networkType}
        backIcon={backIcon}
        nickName={accountInfo?.nickName}
        walletAvatar={'master1'}
        onAvatarClick={onAvatarClick}
        accountBalanceUSD={accountBalanceUSD}
        caAddressInfos={caAddressInfos}
        onBuy={() => {
          if (!isLoginOnChain) {
            return loadingTip({ msg: loginOptTip });
          }
          // TODO select Token
          if (!supportToken?.[0]) return singleMessage.error('There is no token that meets the requirements');

          onBuy?.(supportToken[0]);
        }}
        onSend={async () => {
          if (!isLoginOnChain) {
            return loadingTip({ msg: loginOptTip });
          }
          setAssetOpen(true);
        }}
        onReceive={() => setTokenOpen(true)}
        onFaucet={onFaucet}
        onBack={onBack}
      />
      <AssetTabs
        networkType={networkType}
        accountNFTList={NFTCollection?.list}
        tokenList={tokenList || tokenListInfo?.list}
        loadMoreNFT={loadMoreNFT}
        isGetNFTCollectionPending={isGetNFTCollectionPending}
        onChange={(v) => {
          if (!caAddressInfos) return;
          if (v === BalanceTab.TOKEN) {
            basicAssetViewAsync
              .setTokenList({
                caAddressInfos,
              })
              .then(dispatch);
          } else if (v === BalanceTab.NFT) {
            setIsGetNFTCollection(true);
            basicAssetViewAsync
              .setNFTCollections({
                caAddressInfos,
                maxNFTCount: maxNftNum,
              })
              .then(dispatch)
              .finally(() => setIsGetNFTCollection(false));
          } else if (v === BalanceTab.ACTIVITY) {
            initActivity();
          }
        }}
        onDataInit={onDataInit}
        onDataInitEnd={onDataInitEnd}
        onViewTokenItem={onViewTokenItem}
        onViewActivityItem={onViewActivityItem}
        onNFTView={onNFTView}
        onCollectionView={onCollectionView}
      />
      <CustomTokenModal
        networkType={networkType}
        open={tokenOpen}
        tokenList={allTokenList || tokenList || tokenListInfo?.list}
        title={'Select Token'}
        searchPlaceHolder={'Search Token'}
        onClose={() => setTokenOpen(false)}
        onChange={(v) => {
          setTokenOpen(false);
          onReceive?.(v);
        }}
      />
      <CustomAssetModal
        caAddressInfos={caAddressInfos}
        networkType={networkType}
        open={assetOpen}
        onCancel={() => setAssetOpen(false)}
        onSelect={(v, type) => {
          setAssetOpen(false);
          onSend?.(v, type);
        }}
      />
    </div>
  );
}

export default function AssetOverviewMain(props: AssetOverviewProps) {
  return (
    <PortkeyOverviewProvider>
      <AssetOverviewContent {...props} />
    </PortkeyOverviewProvider>
  );
}
