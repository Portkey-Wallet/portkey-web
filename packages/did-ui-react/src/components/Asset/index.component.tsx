import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AssetOverviewMain, { AssetOverviewProps } from '../AssetOverview/index.components';
import ReceiveCard from '../ReceiveCard';
import { basicAssetViewAsync } from '../context/PortkeyAssetProvider/actions';
import useNFTMaxCount from '../../hooks/useNFTMaxCount';
import { usePortkey } from '../context';
import { ChainId } from '@portkey/types';
import { did } from '../../utils';
import { IUserTokenItem } from '@portkey/services';
import { BaseToken } from '../types/assets';
import { sleep } from '@portkey/utils';

export interface AssetMainProps extends Omit<AssetOverviewProps, 'onReceive' | 'onBuy' | 'onBack'> {
  onOverviewBack?: () => void;
}

export enum AssetStep {
  overview = 'overview',
  receive = 'receive',
  buy = 'buy',
}

export default function AssetMain({ isShowBuy = true, faucetUrl, backIcon, onOverviewBack }: AssetMainProps) {
  const [{ networkType }] = usePortkey();
  const [{ caInfo, initialized }, { dispatch }] = usePortkeyAsset();

  const [assetStep, setAssetStep] = useState<AssetStep>(AssetStep.receive);

  const maxNftNum = useNFTMaxCount();

  const caAddressInfos = useMemo(() => {
    if (!caInfo) return;
    return Object.entries(caInfo ?? {}).map(([chainId, info]) => ({
      chainId: chainId as ChainId,
      caAddress: info.caAddress,
    }));
  }, [caInfo]);

  const [allToken, setAllToken] = useState<IUserTokenItem[]>();
  const getAllTokenList = useCallback(async () => {
    if (!caAddressInfos) return;
    const chainIdArray = caAddressInfos.map((info) => info.chainId);
    const result = await did.assetsServices.getUserTokenList({
      chainIdArray,
      keyword: '',
    });
    if (!result?.items) return;
    setAllToken(result.items);
  }, [caAddressInfos]);

  useEffect(() => {
    if (initialized && caAddressInfos) {
      // TODO Request all data at once, no paging request
      basicAssetViewAsync
        .setTokenList({
          caAddressInfos,
        })
        .then(dispatch);

      basicAssetViewAsync
        .setNFTCollections({
          caAddressInfos,
          maxNFTCount: maxNftNum,
        })
        .then(dispatch);

      getAllTokenList();
    }
  }, [caAddressInfos, dispatch, getAllTokenList, initialized, maxNftNum]);

  const [selectToken, setSelectToken] = useState<BaseToken>();
  return (
    <div>
      {assetStep === AssetStep.overview && (
        <AssetOverviewMain
          allToken={allToken}
          isShowBuy={isShowBuy}
          faucetUrl={faucetUrl}
          backIcon={backIcon}
          onBack={onOverviewBack}
          onReceive={async (v) => {
            setSelectToken(v);
            await sleep(50);
            setAssetStep(AssetStep.receive);
          }}
          onBuy={() => setAssetStep(AssetStep.buy)}
        />
      )}
      {assetStep === AssetStep.receive && selectToken && (
        <ReceiveCard
          toInfo={{
            address: selectToken.address,
            name: '',
          }}
          assetInfo={{
            symbol: selectToken.symbol,
            tokenContractAddress: selectToken.address,
            chainId: selectToken.chainId,
            decimals: selectToken.decimals,
          }}
          networkType={networkType}
          chainId={selectToken.chainId}
          onBack={() => setAssetStep(AssetStep.overview)}
        />
      )}
      {assetStep === AssetStep.buy && 'buy'}
    </div>
  );
}
2;
