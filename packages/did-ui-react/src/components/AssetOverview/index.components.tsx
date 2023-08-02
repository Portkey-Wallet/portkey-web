import AssetCard from '../AssetCard';
import { usePortkey } from '../context';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import TokenAndNFT, { TokenAndNFTProps } from '../TokenAndNFT';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { MAINNET } from '../../constants/network';
import { basicAssetViewAsync } from '../context/PortkeyAssetProvider/actions';
import { setLoading } from '../../utils';
import { ZERO } from '../../constants/misc';
import { BaseToken, TokenItemShowType } from '../types/assets';
import { divDecimals, formatAmountShow } from '../../utils/converter';
import CustomTokenModal from '../CustomTokenModal';
import { ChainId } from '@portkey/types';
import { IUserTokenItem } from '@portkey/services';

export interface AssetOverviewProps {
  allToken?: IUserTokenItem[];
  isShowBuy?: boolean;
  backIcon?: ReactNode;
  faucetUrl?: string; // Only when testing the network, you can configure the faucet address
  onReceive?: (selectToken: BaseToken) => void;
  onBuy?: () => void;
  onBack?: () => void;
}

export default function AssetOverviewMain({
  allToken,
  isShowBuy = true,
  faucetUrl,
  backIcon = <></>,
  onBack,
  onBuy,
  onReceive,
}: AssetOverviewProps) {
  const [{ networkType }] = usePortkey();
  const [{ accountInfo, tokenListInfo, caInfo, NFTCollection, tokenPrices }, { dispatch }] = usePortkeyAsset();

  const [accountBalanceUSD, setAccountBalanceUSD] = useState<string>();
  const [tokenList, setTokenList] = useState<TokenItemShowType[]>();

  const [tokenOpen, setTokenOpen] = useState(false);

  const onFaucet = useCallback(() => {
    if (faucetUrl && networkType !== MAINNET) window.open(faucetUrl);
  }, [faucetUrl, networkType]);

  const loadMoreNFT: Required<TokenAndNFTProps>['loadMoreNFT'] = useCallback(
    async ({ symbol, chainId, pageNum }) => {
      const targetNFTCollection = NFTCollection?.list.find(
        (item) => item.symbol === symbol && item.chainId === chainId,
      );
      if (!targetNFTCollection) return;

      const { skipCount, maxResultCount, totalRecordCount, children } = targetNFTCollection;

      // has cache data
      if ((pageNum + 1) * maxResultCount <= children.length) return;

      const caAddressInfos = Object.entries(caInfo).map(([chainId, info]) => ({
        chainId: chainId as ChainId,
        caAddress: info.caAddress,
      }));
      if (totalRecordCount === 0 || Number(totalRecordCount) > children.length) {
        setLoading(true);
        basicAssetViewAsync
          .setNFTItem({
            chainId,
            symbol,
            caAddressInfos,
            skipCount,
            maxResultCount,
          })
          .then(dispatch)
          .finally(() => setLoading(false));
      }
    },
    [NFTCollection?.list, caInfo, dispatch],
  );
  // get Token price
  useEffect(() => {
    const symbols = tokenListInfo?.list.map((tokenInfo) => tokenInfo.symbol);
    if (!symbols) return;
    basicAssetViewAsync.setTokenPrices({ symbols }).then(dispatch);
  }, [tokenListInfo, dispatch]);

  // Calculate the user's total balance
  useEffect(() => {
    if (networkType !== MAINNET) return;
    if (!tokenPrices?.tokenPriceObject) return;
    if (!tokenListInfo?.list) return;
    const tokenList = tokenListInfo?.list.map((token) => ({
      ...token,
      balanceInUsd: ZERO.plus(divDecimals(token.balance ?? 0, token.decimals))
        .times(tokenPrices.tokenPriceObject[token.symbol])
        .toString(),
    }));
    setTokenList(tokenList);

    const totalBalanceInUSD = tokenList.reduce((pre, cur) => {
      return pre.plus(cur.balanceInUsd ?? ZERO);
    }, ZERO);

    setAccountBalanceUSD(formatAmountShow(totalBalanceInUSD, 2));
  }, [networkType, tokenListInfo?.list, tokenPrices?.tokenPriceObject]);

  const allTokenList = useMemo(() => allToken?.map((tokenItem) => tokenItem.token), [allToken]);

  return (
    <div className="portkey-ui-asset-overview">
      <AssetCard
        isShowBuy={isShowBuy}
        isShowFaucet={Boolean(faucetUrl)}
        networkType={networkType}
        backIcon={backIcon}
        nickName={accountInfo?.nickName}
        accountBalanceUSD={accountBalanceUSD}
        onBuy={onBuy}
        onReceive={() => setTokenOpen(true)}
        onFaucet={onFaucet}
        onBack={onBack}
      />
      <TokenAndNFT
        networkType={networkType}
        accountNFTList={NFTCollection?.list}
        tokenList={tokenList || tokenListInfo?.list}
        loadMoreNFT={loadMoreNFT}
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
    </div>
  );
}
