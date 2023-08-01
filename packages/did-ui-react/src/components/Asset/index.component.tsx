import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { useEffect, useState } from 'react';
import AssetOverviewMain, { AssetOverviewProps } from '../AssetOverview/index.components';
import ReceiveCard from '../ReceiveCard';
import { basicAssetViewAsync } from '../context/PortkeyAssetProvider/actions';
import useNFTMaxCount from '../../hooks/useNFTMaxCount';

export interface AssetMainProps extends Omit<AssetOverviewProps, 'onReceive' | 'onBuy' | 'onBack'> {
  onOverviewBack?: () => void;
}

export enum AssetStep {
  overview = 'overview',
  receive = 'receive',
  buy = 'buy',
}

export default function AssetMain({ isShowBuy = true, faucetUrl, backIcon, onOverviewBack }: AssetMainProps) {
  const [{ caInfo, initialized }, { dispatch }] = usePortkeyAsset();
  const [assetStep, setAssetStep] = useState<AssetStep>(AssetStep.overview);

  const maxNftNum = useNFTMaxCount();

  useEffect(() => {
    if (initialized && caInfo) {
      const caAddressInfos: any = Object.entries(caInfo).map(([chainId, info]) => ({
        chainId,
        caAddress: info.caAddress,
      }));
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
    }
  }, [caInfo, dispatch, initialized, maxNftNum]);

  return (
    <div>
      {assetStep === AssetStep.overview && (
        <AssetOverviewMain
          isShowBuy={isShowBuy}
          faucetUrl={faucetUrl}
          backIcon={backIcon}
          onBack={onOverviewBack}
          onReceive={() => setAssetStep(AssetStep.receive)}
          onBuy={() => setAssetStep(AssetStep.buy)}
        />
      )}
      {assetStep === AssetStep.receive && <ReceiveCard onBack={() => setAssetStep(AssetStep.overview)} />}
      {assetStep === AssetStep.buy && 'buy'}
    </div>
  );
}
2;
