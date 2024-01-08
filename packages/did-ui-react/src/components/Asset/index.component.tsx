import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { useCallback, useMemo, useRef, useState } from 'react';
import AssetOverviewMain, { AssetOverviewProps } from '../AssetOverview/index.components';
import ReceiveCard from '../ReceiveCard/index.components';
import { basicAssetViewAsync } from '../context/PortkeyAssetProvider/actions';
import useNFTMaxCount from '../../hooks/useNFTMaxCount';
import { usePortkey } from '../context';
import { ActivityItemType, ChainId } from '@portkey/types';
import { WalletError, dealURLLastChar, did, handleErrorMessage } from '../../utils';
import { IAssetItemType, ITransferLimitItem, IUserTokenItem } from '@portkey/services';
import { BaseToken, NFTItemBaseExpand, TokenItemShowType } from '../types/assets';
import { sleep } from '@portkey/utils';
import RampMain from '../Ramp/index.component';
import { MAINNET } from '../../constants/network';
import { IAchConfig, IRampInitState, IRampPreviewInitState } from '../../types';
import RampPreviewMain from '../RampPreview/index.component';
import ConfigProvider from '../config-provider';
import { useUpdateEffect } from 'react-use';
import SendMain, { SendExtraConfig } from '../Send/index.components';
import Transaction from '../Transaction/index.component';
import TokenDetailMain from '../TokenDetail';
import NFTDetailMain from '../NFTDetail/index.component';
import clsx from 'clsx';
import PaymentSecurity from '../PaymentSecurity';
import TransferSettings from '../TransferSettings';
import TransferSettingsEdit from '../TransferSettingsEdit';
import Guardian from '../Guardian';
import MenuListMain from '../MenuList/index.components';
import { useMyMenuList, useWalletSecurityMenuList } from '../../hooks/my';
import { getTransferLimit } from '../../utils/sandboxUtil/getTransferLimit';
import { getChain } from '../../hooks/useChainInfo';
import { ITransferLimitItemWithRoute } from '../TransferSettingsEdit/index.components';
import useDebounce from '../../hooks/useDebounce';
import singleMessage from '../CustomAnt/message';
import './index.less';

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
  isShowRampBuy?: boolean;
  isShowRampSell?: boolean;
  onLifeCycleChange?(liftCycle: `${AssetStep}`): void;
}

const InitTransferLimitData: ITransferLimitItemWithRoute = {
  chainId: 'AELF',
  symbol: 'ELF',
  singleLimit: '20000000000',
  dailyLimit: '100000000000',
  restricted: true,
  decimals: 8,
};

function AssetMain({
  isShowRamp = true,
  rampState,
  faucet,
  backIcon,
  className,
  overrideAchConfig,
  isShowRampBuy = true,
  isShowRampSell = true,
  onOverviewBack,
  onLifeCycleChange,
}: AssetMainProps) {
  const [{ networkType, sandboxId }] = usePortkey();
  const [{ caInfo, initialized, originChainId, caHash, managementAccount }, { dispatch }] = usePortkeyAsset();
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
  const [accelerateChainId, setAccelerateChainId] = useState<ChainId>(originChainId);
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

  const getAssetInfo = useCallback(() => {
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

  useDebounce(getAssetInfo, 300);

  const [selectToken, setSelectToken] = useState<BaseToken>();

  const [sendToken, setSendToken] = useState<IAssetItemType>();
  const [sendExtraConfig, setSendExtraConfig] = useState<SendExtraConfig>();
  const [rampExtraConfig, setRampExtraConfig] = useState<IRampInitState | undefined>(rampState);
  const [rampPreview, setRampPreview] = useState<IRampPreviewInitState>();

  const [transactionDetail, setTransactionDetail] = useState<ActivityItemType & { chainId?: ChainId }>();
  const [NFTDetail, setNFTDetail] = useState<NFTItemBaseExpand>();

  const [tokenDetail, setTokenDetail] = useState<TokenItemShowType>();

  const [viewPaymentSecurity, setViewPaymentSecurity] = useState<ITransferLimitItemWithRoute>(InitTransferLimitData);

  const onAvatarClick = useCallback(async () => {
    setAssetStep(AssetStep.my);
  }, []);

  const onReceive = useCallback(async (v: any) => {
    setSelectToken({
      ...v,
      address: v.address || v.tokenContractAddress,
    });
    await sleep(50);
    setAssetStep(AssetStep.receive);
  }, []);

  const onBuy = useCallback(
    async (v: any) => {
      if (!portkeyWebSocketUrl) return singleMessage.error('Please configure socket service url in setGlobalConfig');
      setSelectToken({
        ...v,
        address: v.address || v.tokenContractAddress,
      });
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

  const myMenuList = useMyMenuList({
    onClickGuardians: () => {
      setAccelerateChainId(originChainId);
      setAssetStep(AssetStep.guardians);
    },
    onClickWalletSecurity: () => setAssetStep(AssetStep.walletSecurity),
  });

  const WalletSecurityMenuList = useWalletSecurityMenuList({
    onClickPaymentSecurity: () => setAssetStep(AssetStep.paymentSecurity),
  });

  const getLimitFromContract = useCallback(
    async (data: ITransferLimitItem) => {
      // get limit from caContract
      try {
        const chainInfo = await getChain(data.chainId);
        const privateKey = managementAccount?.privateKey;
        if (!privateKey) throw WalletError.invalidPrivateKey;
        if (!caHash) throw 'Please login';

        const res = await getTransferLimit({
          caHash: caHash,
          symbol: data.symbol,
          rpcUrl: chainInfo?.endPoint || '',
          caContractAddress: chainInfo?.caContractAddress || '',
          sandboxId,
        });
        return res;
      } catch (error) {
        const err = handleErrorMessage(error);
        return singleMessage.error(err);
      }
    },
    [caHash, managementAccount?.privateKey, sandboxId],
  );

  const transferSettingsEditBack = useCallback(
    async (data: ITransferLimitItemWithRoute) => {
      const res = await getLimitFromContract(data);
      setViewPaymentSecurity({ ...data, ...res });
      if (data?.businessFrom?.module === 'ramp-sell') {
        setRampExtraConfig({ ...data.businessFrom.extraConfig });
        setAssetStep(AssetStep.ramp);
        return;
      }
      if (data?.businessFrom?.module === 'send') {
        setSendExtraConfig({
          ...data.businessFrom.extraConfig,
        });
        setAssetStep(AssetStep.send);
        return;
      }
      return setAssetStep(AssetStep.transferSettings);
    },
    [getLimitFromContract],
  );

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
          initState={rampExtraConfig}
          portkeyWebSocketUrl={portkeyWebSocketUrl}
          tokenInfo={{
            ...selectToken,
            tokenContractAddress: selectToken.address,
          }}
          onBack={() => {
            setRampExtraConfig(undefined);
            onBack();
          }}
          onShowPreview={({ initState }) => {
            setRampPreview(initState);
            setAssetStep(AssetStep.rampPreview);
          }}
          isBuySectionShow={isShowRampBuy}
          isSellSectionShow={isShowRampSell}
          isMainnet={networkType === MAINNET}
          onModifyLimit={async (data) => {
            const res = await getLimitFromContract(data);
            setViewPaymentSecurity({ ...data, ...res });
            setAssetStep(AssetStep.transferSettingsEdit);
          }}
          onModifyGuardians={() => {
            setAccelerateChainId(selectToken.chainId);
            setAssetStep(AssetStep.guardians);
          }}
        />
      )}
      {assetStep === AssetStep.rampPreview && selectToken && rampPreview && (
        <RampPreviewMain
          initState={rampPreview}
          portkeyServiceUrl={portkeyServiceUrl || 'https://did-portkey.portkey.finance'}
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
          extraConfig={sendExtraConfig}
          onCancel={() => {
            setSendExtraConfig(undefined);
            onBack();
          }}
          onSuccess={() => {
            setAssetStep(AssetStep.overview);
          }}
          onModifyLimit={async (data) => {
            const res = await getLimitFromContract(data);
            setViewPaymentSecurity({ ...data, ...res });
            setAssetStep(AssetStep.transferSettingsEdit);
          }}
          onModifyGuardians={() => {
            setAccelerateChainId(sendToken.chainId as ChainId);
            setAssetStep(AssetStep.guardians);
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
        // My
        <MenuListMain
          menuList={myMenuList}
          headerConfig={{
            title: 'My',
            onBack: () => setAssetStep(AssetStep.overview),
          }}
        />
      )}

      {assetStep === AssetStep.guardians && (
        <Guardian
          sandboxId={sandboxId}
          caHash={caHash || ''}
          networkType={networkType}
          originChainId={originChainId}
          accelerateChainId={accelerateChainId}
          onBack={() => setAssetStep(AssetStep.my)}
        />
      )}

      {assetStep === AssetStep.walletSecurity && (
        // My - WalletSecurity
        <MenuListMain
          menuList={WalletSecurityMenuList}
          headerConfig={{
            title: 'Wallet Security',
            onBack: () => setAssetStep(AssetStep.my),
          }}
        />
      )}

      {assetStep === AssetStep.paymentSecurity && (
        <PaymentSecurity
          onBack={() => setAssetStep(AssetStep.walletSecurity)}
          networkType={networkType}
          caHash={caHash || ''}
          onClickItem={async (data) => {
            const res = await getLimitFromContract(data);
            setViewPaymentSecurity({ ...data, ...res });
            setAssetStep(AssetStep.transferSettings);
          }}
        />
      )}

      {assetStep === AssetStep.transferSettings && (
        <TransferSettings
          onBack={() => setAssetStep(AssetStep.paymentSecurity)}
          initData={viewPaymentSecurity}
          onEdit={() => setAssetStep(AssetStep.transferSettingsEdit)}
        />
      )}

      {assetStep === AssetStep.transferSettingsEdit && (
        <TransferSettingsEdit
          initData={viewPaymentSecurity}
          caHash={caHash || ''}
          originChainId={originChainId}
          sandboxId={sandboxId}
          onBack={transferSettingsEditBack}
          onSuccess={transferSettingsEditBack}
        />
      )}
    </div>
  );
}

export default AssetMain;
