import AssetCard from '../AssetCard';
import { usePortkey } from '../context';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import AssetTabs, { AssetTabsProps } from '../AssetTabs';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { MAINNET } from '../../constants/network';
import { basicAssetViewAsync } from '../context/PortkeyAssetProvider/actions';
import { ZERO } from '../../constants/misc';
import { BalanceTab, BaseToken, IFaucetConfig, NFTItemBaseExpand, TokenItemShowType, TokenType } from '../types/assets';
import { formatAmountShow } from '../../utils/converter';
import CustomTokenModal from '../CustomTokenModal';
import { ActivityItemType, ChainId } from '@portkey/types';
import { IAssetItemType, IUserTokenItem } from '@portkey/services';
import { ELF_SYMBOL } from '../../constants/assets';
import { message } from 'antd';
import useNFTMaxCount from '../../hooks/useNFTMaxCount';
import CustomAssetModal from '../CustomAssetModal';
import { PortkeyOverviewProvider } from '../context/PortkeyOverviewProvider';
import { useFaucet } from '../../hooks/useFaucet';

export interface AssetOverviewProps {
  allToken?: IUserTokenItem[];
  isShowRamp?: boolean;
  backIcon?: ReactNode;
  faucet?: IFaucetConfig;
  onAvatarClick?: () => void;
  onReceive?: (selectToken: BaseToken) => void;
  onBuy?: (selectToken: BaseToken) => void;
  onBack?: () => void;
  onSend?: (selectToken: IAssetItemType, type: TokenType) => void;
  onViewActivityItem?: (item: ActivityItemType) => void;
  onViewTokenItem?: (v: TokenItemShowType) => void;
  onNFTView?: (item: NFTItemBaseExpand) => void;
}

export function AssetOverviewContent({
  allToken,
  isShowRamp = true,
  faucet,
  backIcon = <></>,
  onAvatarClick,
  onBuy,
  onSend,
  onBack,
  onNFTView,
  onReceive,
  onViewTokenItem,
  onViewActivityItem,
}: AssetOverviewProps) {
  const [{ networkType }] = usePortkey();
  const [{ accountInfo, tokenListInfo, caInfo, NFTCollection }, { dispatch }] = usePortkeyAsset();

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
          .setNFTItem({
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
      return pre.plus(cur.balanceInUsd ?? ZERO);
    }, ZERO);

    setAccountBalanceUSD(formatAmountShow(totalBalanceInUSD, 2));
  }, [networkType, tokenListInfo?.list]);

  const allTokenList = useMemo(() => allToken?.map((tokenItem) => tokenItem.token), [allToken]);
  const supportToken = useMemo(
    () => allTokenList?.filter((token) => token.chainId === 'AELF' && token.symbol === ELF_SYMBOL),
    [allTokenList],
  );

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
        onBuy={() => {
          // TODO select Token
          if (!supportToken?.[0]) return message.error('There is no token that meets the requirements');

          onBuy?.(supportToken[0]);
        }}
        onSend={async () => {
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
          }
        }}
        onViewTokenItem={onViewTokenItem}
        onViewActivityItem={onViewActivityItem}
        onNFTView={onNFTView}
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
