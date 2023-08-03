import AssetCard from '../AssetCard';
import { usePortkey } from '../context';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import TokenAndNFT, { TokenAndNFTProps } from '../TokenAndNFT';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { MAINNET, MAIN_CHAIN_ID } from '../../constants/network';
import { basicAssetViewAsync } from '../context/PortkeyAssetProvider/actions';
import { handleErrorMessage, setLoading } from '../../utils';
import { ZERO } from '../../constants/misc';
import { BalanceTab, BaseToken, IFaucetConfig, TokenItemShowType } from '../types/assets';
import { divDecimals, formatAmountShow, timesDecimals } from '../../utils/converter';
import CustomTokenModal from '../CustomTokenModal';
import { ChainId } from '@portkey/types';
import { IUserTokenItem } from '@portkey/services';
import { ELF_SYMBOL } from '../../constants/assets';
import { message } from 'antd';
import { callCASendMethod } from '../../utils/sandboxUtil/callCASendMethod';
import useNFTMaxCount from '../../hooks/useNFTMaxCount';

export interface AssetOverviewProps {
  allToken?: IUserTokenItem[];
  isShowRamp?: boolean;
  backIcon?: ReactNode;
  faucet?: IFaucetConfig;
  onReceive?: (selectToken: BaseToken) => void;
  onBuy?: (selectToken: BaseToken) => void;
  onBack?: () => void;
}

export default function AssetOverviewMain({
  allToken,
  isShowRamp = true,
  faucet,
  backIcon = <></>,
  onBack,
  onBuy,
  onReceive,
}: AssetOverviewProps) {
  const [{ networkType, sandboxId, chainType }] = usePortkey();
  const [{ accountInfo, tokenListInfo, caInfo, NFTCollection, tokenPrices, caHash, managementAccount }, { dispatch }] =
    usePortkeyAsset();

  const [accountBalanceUSD, setAccountBalanceUSD] = useState<string>();
  const [tokenList, setTokenList] = useState<TokenItemShowType[]>();

  const [tokenOpen, setTokenOpen] = useState(false);
  const maxNftNum = useNFTMaxCount();

  console.log(caHash, managementAccount?.privateKey, 'callCASendMethod');
  const caAddressInfos = useMemo(() => {
    if (!caInfo) return;
    return Object.entries(caInfo ?? {}).map(([chainId, info]) => ({
      chainId: chainId as ChainId,
      caAddress: info.caAddress,
    }));
  }, [caInfo]);

  const onFaucet = useCallback(async () => {
    const faucetUrl = faucet?.faucetUrl;
    const faucetContractAddress = faucet?.faucetContractAddress;
    if (faucetUrl && networkType !== MAINNET) return window.open(faucetUrl);
    if (!faucetContractAddress) return message.error('Please configure `faucets`');
    console.log(caHash, managementAccount?.privateKey, 'callCASendMethod');
    if (!caHash || !managementAccount?.privateKey) return message.error('Please confirm whether to log in!');
    try {
      setLoading(true);
      const result = await callCASendMethod({
        methodName: 'ClaimToken',
        paramsOption: {
          symbol: 'ELF',
          amount: timesDecimals(100, 8).toString(),
        },
        sandboxId,
        chainId: MAIN_CHAIN_ID,
        caHash,
        chainType,
        contractAddress: faucetContractAddress,
        privateKey: managementAccount?.privateKey,
      });
      setLoading(false);
      message.success('Token successfully requested');
      // TODO
      console.log(result, 'result==callCASendMethod');
    } catch (error) {
      setLoading(false);
      message.error(handleErrorMessage(error));
    }
  }, [caHash, chainType, faucet, managementAccount?.privateKey, networkType, sandboxId]);

  const loadMoreNFT: Required<TokenAndNFTProps>['loadMoreNFT'] = useCallback(
    async ({ symbol, chainId, pageNum }) => {
      const targetNFTCollection = NFTCollection?.list.find(
        (item) => item.symbol === symbol && item.chainId === chainId,
      );
      if (!targetNFTCollection) return;

      const { skipCount, maxResultCount, totalRecordCount, children } = targetNFTCollection;

      // has cache data
      if ((pageNum + 1) * maxResultCount <= children.length) return;

      const caAddressInfos = Object.entries(caInfo ?? {}).map(([chainId, info]) => ({
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
  const supportToken = useMemo(
    () => allTokenList?.filter((token) => token.chainId === 'AELF' && token.symbol === ELF_SYMBOL),
    [allTokenList],
  );

  return (
    <div className="portkey-ui-asset-overview">
      <AssetCard
        isShowRamp={isShowRamp}
        isShowFaucet={Boolean(faucet?.faucetUrl || faucet?.faucetContractAddress)}
        networkType={networkType}
        backIcon={backIcon}
        nickName={accountInfo?.nickName}
        accountBalanceUSD={accountBalanceUSD}
        onBuy={() => {
          // TODO select Token
          if (!supportToken?.[0]) return message.error('There is no token that meets the requirements');

          onBuy?.(supportToken[0]);
        }}
        onReceive={() => setTokenOpen(true)}
        onFaucet={onFaucet}
        onBack={onBack}
      />
      <TokenAndNFT
        networkType={networkType}
        accountNFTList={NFTCollection?.list}
        tokenList={tokenList || tokenListInfo?.list}
        loadMoreNFT={loadMoreNFT}
        onChange={(v) => {
          if (!caAddressInfos) return;
          if (v === BalanceTab.TOKEN) {
            basicAssetViewAsync
              .setTokenList({
                caAddressInfos,
              })
              .then(dispatch);
          } else if (v === BalanceTab.NFT) {
            basicAssetViewAsync
              .setNFTCollections({
                caAddressInfos,
                maxNFTCount: maxNftNum,
              })
              .then(dispatch);
          }
        }}
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
