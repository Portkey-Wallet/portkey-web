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
import RampMain from '../Ramp/index.component';
import { MAINNET } from '../../constants/network';
import { IAchConfig, IRampInitState, IRampPreviewInitState } from '../../types';
import RampPreviewMain from '../RampPreview/index.component';

export interface AssetMainProps extends Omit<AssetOverviewProps, 'onReceive' | 'onBuy' | 'onBack' | 'allToken'> {
  onOverviewBack?: () => void;
  rampState?: IRampInitState;
  // if `${isShowRamp = true}` Please configure the API service of portkey
  portkeyServiceUrl?: string;
  className?: string;
  overrideAchConfig?: IAchConfig;
}

export enum AssetStep {
  overview = 'overview',
  receive = 'receive',
  ramp = 'ramp',
  rampPreview = 'rampPreview',
}

export default function AssetMain({
  isShowRamp = true,
  rampState,
  faucet,
  backIcon,
  className,
  portkeyServiceUrl,
  overrideAchConfig,
  onOverviewBack,
}: AssetMainProps) {
  const [{ networkType }] = usePortkey();
  const [{ caInfo, initialized }, { dispatch }] = usePortkeyAsset();

  const [assetStep, setAssetStep] = useState<AssetStep>();

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
    const result = await did.services.assets.getUserTokenList({
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

  const [rampPreview, setRampPreview] = useState<IRampPreviewInitState>();

  return (
    <div className={className}>
      {(!assetStep || assetStep === AssetStep.overview) && (
        <AssetOverviewMain
          allToken={allToken}
          isShowRamp={isShowRamp}
          faucet={faucet}
          backIcon={backIcon}
          onBack={onOverviewBack}
          onReceive={async (v) => {
            setSelectToken(v);
            await sleep(50);
            setAssetStep(AssetStep.receive);
          }}
          onBuy={async (v) => {
            setSelectToken(v);
            await sleep(50);
            setAssetStep(AssetStep.ramp);
          }}
        />
      )}
      {assetStep === AssetStep.receive && caInfo && selectToken && (
        <ReceiveCard
          toInfo={{
            address: caInfo[selectToken.chainId]?.caAddress,
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
      {assetStep === AssetStep.ramp && selectToken && (
        <RampMain
          initState={rampState}
          tokenInfo={{
            ...selectToken,
            tokenContractAddress: selectToken.address,
          }}
          goBack={() => setAssetStep(AssetStep.overview)}
          goPreview={({ initState }) => {
            setRampPreview(initState);
            setAssetStep(AssetStep.rampPreview);
          }}
          isBuySectionShow={true}
          isSellSectionShow={true}
          isMainnet={networkType === MAINNET}
        />
      )}
      {assetStep === AssetStep.rampPreview && rampPreview && (
        <RampPreviewMain
          initState={rampPreview}
          portkeyServiceUrl={portkeyServiceUrl || ''}
          goBack={() => {
            setAssetStep(AssetStep.ramp);
          }}
          isBuySectionShow={true}
          isSellSectionShow={true}
          overrideAchConfig={overrideAchConfig}
        />
      )}
    </div>
  );
}
