import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { useCallback, useMemo, useRef, useState } from 'react';
import AssetOverviewMain, { AssetOverviewProps } from '../AssetOverview/index.components';
import ReceiveCard from '../ReceiveCard/index.components';
import { basicAssetViewAsync } from '../context/PortkeyAssetProvider/actions';
import useNFTMaxCount from '../../hooks/useNFTMaxCount';
import { usePortkey } from '../context';
import { ActivityItemType, ChainId } from '@portkey/types';
import { dealURLLastChar, did } from '../../utils';
import { IAssetItemType, IPaymentSecurityItem, IUserTokenItem } from '@portkey/services';
import { BaseToken, NFTItemBaseExpand, TokenItemShowType } from '../types/assets';
import { sleep } from '@portkey/utils';
import RampMain from '../Ramp/index.component';
import { MAINNET } from '../../constants/network';
import { IAchConfig, IRampInitState, IRampPreviewInitState } from '../../types';
import RampPreviewMain from '../RampPreview/index.component';
import ConfigProvider from '../config-provider';
import { message } from 'antd';
import { useUpdateEffect } from 'react-use';
import { useThrottleEffect } from '../../hooks/throttle';
import SendMain from '../Send/index.components';
import Transaction from '../Transaction/index.component';
import TokenDetailMain from '../TokenDetail';
import NFTDetailMain from '../NFTDetail/index.component';
import clsx from 'clsx';
import './index.less';
import My from '../My';
import WalletSecurity from '../WalletSecurity';
import PaymentSecurity from '../PaymentSecurity';
import TransferSettings from '../TransferSettings';
import TransferSettingsEdit from '../TransferSettingsEdit';

export enum AssetStep {
  overview = 'overview',
  receive = 'receive',
  ramp = 'ramp',
  rampPreview = 'rampPreview',
  send = 'send',
  transactionDetail = 'transactionDetail',
  tokenDetail = 'tokenDetail',
  NFTDetail = 'NFTDetail',
  my = 'my',
  guardians = 'guardians',
  walletSecurity = 'walletSecurity',
  paymentSecurity = 'paymentSecurity',
  transferSettings = 'transferSettings',
  transferSettingsEdit = 'transferSettingsEdit',
}

export interface AssetMainProps
  extends Omit<AssetOverviewProps, 'onReceive' | 'onBuy' | 'onBack' | 'allToken' | 'onViewTokenItem'> {
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

  const [assetStep, setAssetStep] = useState<AssetStep>(AssetStep.overview);
  const preStepRef = useRef<AssetStep>(AssetStep.overview);

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

  useThrottleEffect(() => {
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

  const [sendToken, setSendToken] = useState<IAssetItemType>();

  const [rampPreview, setRampPreview] = useState<IRampPreviewInitState>();

  const [transactionDetail, setTransactionDetail] = useState<ActivityItemType & { chainId?: ChainId }>();
  const [NFTDetail, setNFTDetail] = useState<NFTItemBaseExpand>();

  const [tokenDetail, setTokenDetail] = useState<TokenItemShowType>();

  const [viewPaymentSecurity, setViewPaymentSecurity] = useState<IPaymentSecurityItem>();

  const onAvatarClick = useCallback(async () => {
    setAssetStep(AssetStep.my);
  }, []);

  const onReceive = useCallback(async (v: BaseToken) => {
    setSelectToken(v);
    await sleep(50);
    setAssetStep(AssetStep.receive);
  }, []);

  const onBuy = useCallback(
    async (v: BaseToken) => {
      if (!portkeyWebSocketUrl) return message.error('Please configure socket service url in setGlobalConfig');
      setSelectToken(v);
      await sleep(50);
      setAssetStep(AssetStep.ramp);
    },
    [portkeyWebSocketUrl],
  );

  const onSend = useCallback(async (v: IAssetItemType) => {
    setSendToken(v);
    setAssetStep(AssetStep.send);
  }, []);

  const onViewActivityItem = useCallback(async (v: ActivityItemType) => {
    setTransactionDetail(v);
    setAssetStep(AssetStep.transactionDetail);
  }, []);

  const onBack = useCallback(() => {
    setAssetStep(preStepRef.current);
  }, []);

  return (
    <div className={clsx('portkey-ui-asset-wrapper', className)}>
      {(!assetStep || assetStep === AssetStep.overview) && (
        <AssetOverviewMain
          allToken={allToken}
          isShowRamp={isShowRamp}
          faucet={faucet}
          backIcon={backIcon}
          onAvatarClick={onAvatarClick}
          onBack={onOverviewBack}
          onReceive={onReceive}
          onBuy={onBuy}
          onSend={(v) => {
            preStepRef.current = AssetStep.overview;

            onSend(v);
          }}
          onViewActivityItem={(v) => {
            preStepRef.current = AssetStep.overview;
            onViewActivityItem(v);
          }}
          onViewTokenItem={(v) => {
            setTokenDetail(v);
            setAssetStep(AssetStep.tokenDetail);
          }}
          onNFTView={(v) => {
            setAssetStep(AssetStep.NFTDetail);
            setNFTDetail(v);
          }}
        />
      )}
      {assetStep === AssetStep.receive && caInfo && selectToken && (
        <ReceiveCard
          receiveInfo={{
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
          onBack={onBack}
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
            setAssetStep(AssetStep.ramp);
          }}
          isBuySectionShow={true}
          isSellSectionShow={true}
          overrideAchConfig={overrideAchConfig}
        />
      )}

      {assetStep === AssetStep.send && sendToken && (
        <SendMain
          assetItem={sendToken}
          onCancel={onBack}
          onSuccess={() => {
            setAssetStep(AssetStep.overview);
          }}
          onClose={() => {
            setAssetStep(AssetStep.overview);
          }}
        />
      )}

      {assetStep === AssetStep.transactionDetail && transactionDetail && caAddressInfos && (
        <Transaction
          chainId={transactionDetail?.chainId}
          caAddressInfos={caAddressInfos}
          onClose={onBack}
          transactionDetail={transactionDetail}
        />
      )}

      {assetStep === AssetStep.tokenDetail && tokenDetail && (
        <TokenDetailMain
          faucet={faucet}
          isShowRamp={isShowRamp}
          tokenInfo={tokenDetail}
          onBack={() => {
            setAssetStep(AssetStep.overview);
          }}
          onReceive={onReceive}
          onBuy={onBuy}
          onSend={(token) => {
            const info: IAssetItemType = {
              chainId: token.chainId,
              symbol: token.symbol,
              address: token.tokenContractAddress || token.address,
              tokenInfo: {
                ...token,
                balance: token.balance || '0',
                decimals: token.decimals.toString(),
                balanceInUsd: token.balanceInUsd || '',
                tokenContractAddress: token.tokenContractAddress || '',
              },
            };
            preStepRef.current = AssetStep.tokenDetail;
            onSend(info);
          }}
          onViewActivityItem={(v) => {
            preStepRef.current = AssetStep.tokenDetail;
            onViewActivityItem(v);
          }}
        />
      )}

      {assetStep === AssetStep.NFTDetail && NFTDetail && (
        <NFTDetailMain
          NFTDetail={NFTDetail}
          onBack={() => setAssetStep(AssetStep.overview)}
          onSend={(nft) => {
            const info: IAssetItemType = {
              chainId: nft.chainId,
              symbol: nft.symbol,
              address: nft.tokenContractAddress,
              nftInfo: nft,
            };
            preStepRef.current = AssetStep.NFTDetail;
            onSend(info);
          }}
        />
      )}

      {assetStep === AssetStep.my && (
        <My
          onClose={() => setAssetStep(AssetStep.overview)}
          onClickGuardians={() => setAssetStep(AssetStep.guardians)}
          onClickWalletSecurity={() => setAssetStep(AssetStep.walletSecurity)}
        />
      )}

      {assetStep === AssetStep.walletSecurity && (
        <WalletSecurity
          onClose={() => setAssetStep(AssetStep.my)}
          onClickPaymentSecurity={() => setAssetStep(AssetStep.paymentSecurity)}
        />
      )}

      {assetStep === AssetStep.paymentSecurity && (
        <PaymentSecurity
          onClose={() => setAssetStep(AssetStep.walletSecurity)}
          networkType={networkType}
          onClickItem={(data) => {
            setViewPaymentSecurity(data);
            setAssetStep(AssetStep.transferSettings);
          }}
        />
      )}

      {assetStep === AssetStep.transferSettings && (
        <TransferSettings
          onClose={() => setAssetStep(AssetStep.paymentSecurity)}
          initData={viewPaymentSecurity}
          onEdit={() => setAssetStep(AssetStep.transferSettingsEdit)}
        />
      )}

      {assetStep === AssetStep.transferSettingsEdit && (
        <TransferSettingsEdit initData={viewPaymentSecurity} onClose={() => setAssetStep(AssetStep.transferSettings)} />
      )}
    </div>
  );
}

export default AssetMain;
