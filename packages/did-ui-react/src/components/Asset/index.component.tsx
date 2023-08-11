import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AssetOverviewMain, { AssetOverviewProps } from '../AssetOverview/index.components';
import ReceiveCard from '../ReceiveCard';
import { basicAssetViewAsync } from '../context/PortkeyAssetProvider/actions';
import useNFTMaxCount from '../../hooks/useNFTMaxCount';
import { usePortkey } from '../context';
import { ChainId } from '@portkey/types';
import { dealURLLastChar, did } from '../../utils';
import { IUserTokenItem } from '@portkey/services';
import { BaseToken } from '../types/assets';
import { sleep } from '@portkey/utils';
import RampMain from '../Ramp/index.component';
import { MAINNET } from '../../constants/network';
import { IAchConfig, IRampInitState, IRampPreviewInitState, RampTypeEnum } from '../../types';
import RampPreviewMain from '../RampPreview/index.component';
import ConfigProvider from '../config-provider';
import { message } from 'antd';
import { useUpdateEffect } from 'react-use';

export enum AssetStep {
  overview = 'overview',
  receive = 'receive',
  ramp = 'ramp',
  rampPreview = 'rampPreview',
}

export interface AssetMainProps extends Omit<AssetOverviewProps, 'onReceive' | 'onBuy' | 'onBack' | 'allToken'> {
  onOverviewBack?: () => void;
  rampState?: IRampInitState;
  className?: string;
  overrideAchConfig?: IAchConfig;
  onLifeCycleChange?(liftCycle: `${AssetStep}`): void;
}

function AssetMain({
  isShowRamp = true,
  rampState,
  faucet,
  backIcon,
  className,
  overrideAchConfig,
  onOverviewBack,
  onLifeCycleChange,
}: AssetMainProps) {
  const [{ networkType }] = usePortkey();
  const [{ caInfo, initialized }, { dispatch }] = usePortkeyAsset();
  const portkeyServiceUrl = useMemo(() => ConfigProvider.config.serviceUrl, []);

  const portkeyWebSocketUrl = useMemo(
    () => ConfigProvider.config.socketUrl || `${dealURLLastChar(portkeyServiceUrl)}/ca`,
    [portkeyServiceUrl],
  );

  const [assetStep, setAssetStep] = useState<AssetStep>();

  console.log(portkeyWebSocketUrl, portkeyWebSocketUrl, 'portkeyWebSocketUrl===');

  useUpdateEffect(() => {
    onLifeCycleChange?.(assetStep || AssetStep.overview);
  }, [assetStep]);

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
            if (!portkeyWebSocketUrl) return message.error('Please configure socket service url in setGlobalConfig');
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
          portkeyWebSocketUrl={portkeyWebSocketUrl}
          tokenInfo={{
            ...selectToken,
            tokenContractAddress: selectToken.address,
          }}
          onBack={() => setAssetStep(AssetStep.overview)}
          onShowPreview={({ initState }) => {
            setRampPreview(initState);
            setAssetStep(AssetStep.rampPreview);
          }}
          isBuySectionShow={true}
          isSellSectionShow={true}
          isShowSelectInModal={true}
          isMainnet={networkType === MAINNET}
        />
      )}
      {assetStep === AssetStep.rampPreview && selectToken && rampPreview && (
        <RampPreviewMain
          initState={rampPreview}
          portkeyServiceUrl={portkeyServiceUrl || ''}
          chainId={selectToken.chainId}
          onBack={() => {
            if (rampState?.side) {
              rampState.side = RampTypeEnum.SELL;
            }
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

export default AssetMain;
