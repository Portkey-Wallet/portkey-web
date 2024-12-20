import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AssetOverviewMain, { AssetOverviewProps } from '../AssetOverview/index.components';
import ReceiveCard from '../ReceiveCard/index.components';
import { basicAssetViewAsync } from '../context/PortkeyAssetProvider/actions';
import useNFTMaxCount from '../../hooks/useNFTMaxCount';
import { usePortkey } from '../context';
import { ChainId, INftInfoType } from '@portkey/types';
import { WalletError, did, handleErrorMessage } from '../../utils';
import { ITransferLimitItem, AllowanceItem, IUserTokenItemNew, IAssetToken } from '@portkey/services';
import {
  BalanceTab,
  BaseToken,
  NFTCollectionItemShowType,
  NFTItemBaseExpand,
  TokenItemShowType,
} from '../types/assets';
import { sleep } from '@portkey/utils';
import RampMain from '../Ramp/index.component';
import { MAINNET } from '../../constants/network';
import { TRampInitState, TRampPreviewInitState } from '../../types';
import RampPreviewMain from '../RampPreview/index.component';
import { useUpdateEffect } from 'react-use';
import SendMain, { SendExtraConfig } from '../Send/index.components';
import TokenDetailMain from '../TokenDetail';
import NFTDetailMain from '../NFTDetail/index.component';
import clsx from 'clsx';
import PaymentSecurity from '../PaymentSecurity';
import TransferSettings from '../TransferSettings';
import Guardian from '../Guardian';
import MenuListMain from '../MenuList/index.components';
import TokenAllowanceDetail from '../TokenAllowanceDetail';
import { useMyMenuList, useWalletSecurityMenuList } from '../../hooks/my';
import { getTransferLimit } from '../../utils/sandboxUtil/getTransferLimit';
import { getChain } from '../../hooks/useChainInfo';
import { useDebounce } from '../../hooks/debounce';
import singleMessage from '../CustomAnt/message';
import CustomSvg from '../CustomSvg';
import './index.less';
import { mixRampShow } from '../Ramp/utils';
import { Button } from 'antd';
import DeleteAccount from '../DeleteAccount/index.component';
import { useIsShowDeletion } from '../../hooks/wallet';
import TokenAllowance from '../TokenAllowance';
import useGAReport from '../../hooks/useGAReport';

import { AssetStep } from '../../constants/assets';
import SetSecondaryMailbox from '../SetSecondaryMailbox';
import { loginOptTip } from '../../constants';
import { loadingTip } from '../../utils/loadingTip';
import CollectionDetailMain from '../CollectionDetail/index.component';
import CommonButton from '../CommonButton';
import { ITransferLimitItemWithRoute } from '../../types/transfer';
import { SendAssetListPage } from '../SendAssetList';
import ReceiveList from '../ReceiveList';

export interface AssetMainProps
  extends Omit<AssetOverviewProps, 'onReceive' | 'onBuy' | 'onBack' | 'allToken' | 'onViewTokenItem'> {
  onOverviewBack?: () => void;
  rampState?: TRampInitState;
  className?: string;
  isShowRampBuy?: boolean;
  isShowRampSell?: boolean;
  onDeleteAccount?: () => void;
  onLifeCycleChange?(liftCycle: `${AssetStep}`): void;
}

export type SelectTokenType = {
  chainId: ChainId;
  symbol: string;
  decimals: number;
  address: string;
  isNFT?: boolean;
};

const InitTransferLimitData: ITransferLimitItemWithRoute = {
  chainId: 'AELF',
  symbol: 'ELF',
  singleLimit: '20000000000',
  dailyLimit: '100000000000',
  restricted: true,
  decimals: 8,
  chainImageUrl: '',
  imageUrl: '',
  displayChainName: '',
};

function AssetMain({
  isShowRamp = true,
  rampState,
  faucet,
  backIcon,
  className,
  isShowRampBuy = true,
  isShowRampSell = true,
  onOverviewBack,
  onDeleteAccount,
  onLifeCycleChange,
}: AssetMainProps) {
  const [{ networkType, sandboxId }] = usePortkey();
  const [{ caInfo, initialized, originChainId, caHash, managementAccount, isLoginOnChain = true }, { dispatch }] =
    usePortkeyAsset();

  const [assetStep, setAssetStep] = useState<AssetStep>(AssetStep.overview);
  const [, setPreStep] = useState<AssetStep>(AssetStep.overview);
  const preStepRef = useRef<AssetStep>(AssetStep.overview);

  const [isMixShowRamp, setIsMixShowRamp] = useState<boolean>(isShowRamp);
  const [isMixShowBuy, setIsMixShowBuy] = useState<boolean>(isShowRampBuy);
  const [isMixShowSell, setIsMixShowSell] = useState<boolean>(isShowRampSell);
  const [originalAllowanceItem, setOriginalAllowanceItem] = useState<AllowanceItem | undefined>();
  const getRampEntry = useCallback(async () => {
    try {
      const { isRampShow, isBuyShow, isSellShow } = await mixRampShow({
        isMainnet: networkType === MAINNET,
        isRampEntryShow: isShowRamp,
        isBuySectionShow: isShowRampBuy,
        isSellSectionShow: isShowRampSell,
        isFetch: true,
      });
      setIsMixShowRamp(isRampShow);
      setIsMixShowBuy(isBuyShow);
      setIsMixShowSell(isSellShow);
    } catch (error) {
      throw handleErrorMessage(error);
    }
  }, [isShowRamp, isShowRampBuy, isShowRampSell, networkType]);

  const getShowDeletion = useIsShowDeletion();

  const maxNftNum = useNFTMaxCount();

  const caAddressInfos = useMemo(() => {
    if (!caInfo) return;
    return Object.entries(caInfo ?? {}).map(([chainId, info]) => ({
      chainId: chainId as ChainId,
      caAddress: info.caAddress,
    }));
  }, [caInfo]);

  const { startReport, endReport } = useGAReport();

  const [allToken, setAllToken] = useState<IUserTokenItemNew[]>();
  const [accelerateChainId, setAccelerateChainId] = useState<ChainId>(originChainId);
  const getAllTokenList = useCallback(async () => {
    if (!caAddressInfos) return;
    const chainIdArray = caAddressInfos.map((info) => info.chainId);
    const result = await did.services.assets.getUserTokenListNew({
      chainIdArray,
      keyword: '',
    });
    if (!result?.items) return;
    setAllToken(result.items);
    endReport('All-TokenList');
  }, [caAddressInfos, endReport]);

  useEffect(() => {
    startReport('Home-NFTsList');
    startReport('Home-TokenList');
    startReport('All-TokenList');
  }, [startReport]);

  const getAssetInfo = useCallback(() => {
    if (initialized && caAddressInfos) {
      // TODO Request all data at once, no paging request
      basicAssetViewAsync
        .setTokenList({
          caAddressInfos,
        })
        .then((res) => {
          dispatch(res);
          endReport('Home-TokenList');
        });

      basicAssetViewAsync
        .setTokenListV2({
          caAddressInfos,
        })
        .then((res) => {
          dispatch(res);
          endReport('Home-TokenList');
        });

      basicAssetViewAsync
        .setNFTCollections({
          caAddressInfos,
          maxNFTCount: maxNftNum,
        })
        .then((res) => {
          dispatch(res);
          endReport('Home-NFTsList');
        });

      getAllTokenList();
      getRampEntry();
    }
  }, [caAddressInfos, dispatch, endReport, getAllTokenList, getRampEntry, initialized, maxNftNum]);

  const [showDeletion, setShowDeletion] = useState<boolean>();

  useEffect(() => {
    if (initialized) {
      getShowDeletion().then(setShowDeletion);
    }
  }, [getShowDeletion, initialized]);

  useDebounce(getAssetInfo, 500);

  const [selectToken, setSelectToken] = useState<BaseToken>();

  const [sendToken, setSendToken] = useState<IAssetToken & INftInfoType & TokenItemShowType & NFTItemBaseExpand>();
  const [sendExtraConfig, setSendExtraConfig] = useState<SendExtraConfig>();
  const [rampExtraConfig, setRampExtraConfig] = useState<TRampInitState | undefined>(rampState);
  const [rampPreview, setRampPreview] = useState<TRampPreviewInitState>();

  const [NFTDetail, setNFTDetail] = useState<NFTItemBaseExpand>();
  const [collectionItem, setCollectionItem] = useState<NFTCollectionItemShowType>();

  const [tokenDetail, setTokenDetail] = useState<TokenItemShowType>();
  const [viewPaymentSecurity, setViewPaymentSecurity] = useState<ITransferLimitItemWithRoute>(InitTransferLimitData);

  const onAvatarClick = useCallback(() => {
    setAssetStep(AssetStep.my);
  }, []);
  const [activeKey, setActiveKey] = useState<string>(BalanceTab.TOKEN);

  // const saveLiftCycleInfo = useCallback(async () => {
  //   console.log('====== saveLiftCycleInfo', assetStep);
  //   let storageValue = {
  //     assetStep: assetStep || AssetStep.overview,
  //     preStep: preStep || AssetStep.overview,
  //     accelerateChainId,
  //   };
  //   switch (assetStep) {
  //     case AssetStep.send:
  //       storageValue = Object.assign(storageValue, {
  //         selectToken,
  //         sendToken,
  //         sendExtraConfig,
  //         viewPaymentSecurity,
  //       });
  //       break;

  //     case AssetStep.transferSettingsEdit:
  //       storageValue = Object.assign(storageValue, {
  //         viewPaymentSecurity,
  //       });
  //       break;
  //     case AssetStep.ramp:
  //       storageValue = Object.assign(storageValue, {
  //         selectToken,
  //         rampExtraConfig,
  //         viewPaymentSecurity,
  //       });

  //       break;

  //     default:
  //       storageValue = Object.assign(storageValue, {
  //         rampExtraConfig: rampState,
  //         viewPaymentSecurity: InitTransferLimitData,
  //       });
  //       break;
  //   }

  //   await did.config.storageMethod.setItem(PortkeyAssetLiftCycle, JSON.stringify(storageValue));
  // }, [
  //   accelerateChainId,
  //   assetStep,
  //   preStep,
  //   rampExtraConfig,
  //   rampState,
  //   selectToken,
  //   sendExtraConfig,
  //   sendToken,
  //   viewPaymentSecurity,
  // ]);

  // const setPageState = useCallback((pageState: TAssetPageState) => {
  //   setAssetStep(pageState.assetStep);
  //   setPreStep(pageState?.preStep || AssetStep.overview);
  //   preStepRef.current = pageState?.preStep || AssetStep.overview;
  //   pageState?.accelerateChainId && setAccelerateChainId(pageState.accelerateChainId);
  //   pageState?.selectToken && setSelectToken(pageState.selectToken);
  //   pageState?.sendToken && setSendToken(pageState.sendToken);
  //   pageState?.sendExtraConfig && setSendExtraConfig(pageState.sendExtraConfig);
  //   pageState?.rampExtraConfig && setRampExtraConfig(pageState.rampExtraConfig);
  //   pageState?.viewPaymentSecurity && setViewPaymentSecurity(pageState.viewPaymentSecurity);
  // }, []);

  // const restorePageState = useCallback(async () => {
  //   // get data from localStorage, for restore page form telegram auth
  //   const storageValue = await did.config.storageMethod.getItem(PortkeyAssetLiftCycle);
  //   if (storageValue && typeof storageValue === 'string') {
  //     const storageValueParsed = JSON.parse(storageValue);
  //     setPageState(storageValueParsed);
  //   }
  // }, [setPageState]);

  // useEffect(() => {
  //   if (initialized) {
  //     restorePageState();
  //   }
  // }, [initialized, restorePageState]);

  useUpdateEffect(() => {
    onLifeCycleChange?.(assetStep || AssetStep.overview);
    // (async () => {
    //   await getSecondaryMail();
    // })();
    // saveLiftCycleInfo();
  }, [assetStep]);

  const onReceive = useCallback(async () => {
    preStepRef.current = assetStep;
    // setSelectToken({
    //   ...v,
    //   address: v.address || v.tokenContractAddress,
    // });
    // await sleep(50);
    setAssetStep(AssetStep.receive);
  }, [assetStep]);

  const onBuy = useCallback(
    async (v: any) => {
      preStepRef.current = assetStep;
      setSelectToken({
        ...v,
        address: v.address || v.tokenContractAddress,
      });
      await sleep(50);
      setAssetStep(AssetStep.ramp);
    },
    [assetStep],
  );

  const onSend = useCallback(async (v?: IAssetToken & INftInfoType & TokenItemShowType & NFTItemBaseExpand) => {
    if (v) {
      setSendToken(v);
      setAssetStep(AssetStep.send);
    } else {
      setAssetStep(AssetStep.sendAssetList);
    }
  }, []);

  const onBack = useCallback(() => {
    console.log('wfs====onBack', preStepRef);
    setAssetStep(preStepRef.current);
  }, []);

  const myMenuList = useMyMenuList({
    onClickGuardians: () => {
      setAccelerateChainId(originChainId);
      setAssetStep(AssetStep.guardians);
    },
    onClickTransactionLimits: () => setAssetStep(AssetStep.transactionLimits),
    onClickTokenAllowances: () => setAssetStep(AssetStep.tokenAllowance),
    onClickBackupEmail: () => setAssetStep(AssetStep.setSecondaryMailbox),
    // onClickWalletSecurity: () => setAssetStep(AssetStep.walletSecurity),
  });

  const WalletSecurityMenuList = useWalletSecurityMenuList({
    onClickPaymentSecurity: () => setAssetStep(AssetStep.transactionLimits),
    onClickTokenAllowance: () => setAssetStep(AssetStep.tokenAllowance),
    onClickSetSecondaryMailbox: async () => {
      setAssetStep(AssetStep.setSecondaryMailbox);
    },
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

  const smallScreen = useMemo(
    () =>
      [AssetStep.receive, AssetStep.ramp, AssetStep.rampPreview, AssetStep.send, AssetStep.NFTDetail].includes(
        assetStep,
      ),
    [assetStep],
  );

  const filterToken = (tokenList: IUserTokenItemNew[]) => {
    const filteredMap: Record<string, any> = {};

    for (const item of tokenList) {
      const { symbol, chainId } = item;

      if (symbol === 'ELF' && chainId === 'AELF') {
        filteredMap[symbol] = item;
      } else if (symbol !== 'ELF') {
        if (!filteredMap[symbol] || chainId === 'tDVW') {
          filteredMap[symbol] = item;
        }
      }
    }

    return Object.values(filteredMap);
  };

  return (
    <div className={clsx('portkey-ui-asset-wrapper portkey-ui-flex-column-center', className)}>
      <div className="portkey-ui-logo portkey-ui-flex-row-center">
        <CustomSvg type="PortkeyLogo" />
      </div>

      <div className={clsx('portkey-ui-asset-container', 'portkey-ui-flex-column', smallScreen && 'small-screen')}>
        <div className="portkey-ui-asset-container-body">
          {(!assetStep || assetStep === AssetStep.overview) && (
            <AssetOverviewMain
              allToken={allToken}
              isShowRamp={isMixShowRamp}
              faucet={faucet}
              backIcon={backIcon}
              isLoginOnChain={isLoginOnChain}
              defaultActiveKey={activeKey}
              setActiveKey={setActiveKey}
              onAvatarClick={onAvatarClick}
              onBack={onOverviewBack}
              onReceive={onReceive}
              onBuy={onBuy}
              onDataInit={() => startReport('Home-Activity')}
              onDataInitEnd={() => endReport('Home-Activity')}
              onSend={(v) => {
                preStepRef.current = AssetStep.overview;
                setPreStep(AssetStep.overview);
                onSend(v);
              }}
              onViewTokenItem={(v) => {
                preStepRef.current = AssetStep.tokenDetail;
                setTokenDetail(v);
                setAssetStep(AssetStep.tokenDetail);
              }}
              onNFTView={(v, collectionItem) => {
                preStepRef.current = AssetStep.overview;
                setAssetStep(AssetStep.NFTDetail);
                setNFTDetail(v);
                setCollectionItem(collectionItem);
              }}
              onCollectionView={(collectionItem) => {
                console.log('wfs====4');
                setAssetStep(AssetStep.collectionDetail);
                setCollectionItem(collectionItem);
              }}
            />
          )}
          {assetStep === AssetStep.sendAssetList && (
            <SendAssetListPage
              caAddressInfos={caAddressInfos}
              networkType={networkType}
              onCancel={() => {
                setAssetStep(AssetStep.overview);
              }}
              onSelect={(v) => {
                setSendToken(v as any);
                setAssetStep(AssetStep.send);
              }}
            />
          )}
          {assetStep === AssetStep.receive && (
            <ReceiveList
              caAddressInfos={caAddressInfos}
              tokenList={filterToken(allToken || [])}
              onBack={onBack}
              onItemClick={(item: SelectTokenType) => {
                if (!item) return;
                setSelectToken(item);
                setAssetStep(AssetStep.receiveDetail);
              }}
            />
          )}
          {assetStep === AssetStep.receiveDetail && caInfo && selectToken && (
            <ReceiveCard
              selectToken={selectToken}
              onBack={() => {
                setAssetStep(AssetStep.receive);
              }}
            />
          )}
          {assetStep === AssetStep.ramp && selectToken && (
            <RampMain
              initState={rampExtraConfig}
              tokenInfo={{
                ...selectToken,
                chainId: selectToken.chainId || 'AELF',
                tokenContractAddress: selectToken.address || '',
              }}
              onBack={() => {
                setRampExtraConfig(undefined);
                onBack();
              }}
              onShowPreview={({ initState }) => {
                setRampPreview(initState);
                setAssetStep(AssetStep.rampPreview);
              }}
              isBuySectionShow={isMixShowBuy}
              isSellSectionShow={isMixShowSell}
              isMainnet={networkType === MAINNET}
              onModifyLimit={async (data) => {
                const res = await getLimitFromContract(data);
                setViewPaymentSecurity({ ...data, ...res });
                setAssetStep(AssetStep.transferSettingsEdit);
              }}
              onModifyGuardians={() => {
                if (!selectToken.chainId) return;
                setAccelerateChainId(selectToken.chainId);
                setAssetStep(AssetStep.guardians);
              }}
            />
          )}
          {assetStep === AssetStep.rampPreview && selectToken && rampPreview && (
            <RampPreviewMain
              isMainnet={networkType === MAINNET}
              initState={rampPreview}
              chainId={selectToken.chainId}
              onBack={(state?: TRampPreviewInitState) => {
                setRampExtraConfig({ ...state });
                setAssetStep(AssetStep.ramp);
              }}
              isBuySectionShow={isMixShowBuy}
              isSellSectionShow={isMixShowSell}
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

          {assetStep === AssetStep.tokenDetail && tokenDetail && (
            <TokenDetailMain
              faucet={faucet}
              isShowRamp={isMixShowRamp}
              tokenInfo={tokenDetail}
              onDataInit={() => startReport('Token-Activity')}
              onDataInitEnd={() => endReport('Token-Activity')}
              onBack={() => {
                setAssetStep(AssetStep.overview);
              }}
              onReceive={onReceive}
              onBuy={onBuy}
              onSend={(token) => {
                if (!isLoginOnChain) {
                  return loadingTip({ msg: loginOptTip });
                }
                preStepRef.current = AssetStep.tokenDetail;
                setPreStep(AssetStep.tokenDetail);
                // TODO-SA
                onSend(token as any);
              }}
            />
          )}
          {assetStep === AssetStep.NFTDetail && NFTDetail && (
            <NFTDetailMain
              NFTDetail={NFTDetail}
              onBack={onBack}
              onCollectionDetail={() => {
                preStepRef.current = AssetStep.NFTDetail;
                setAssetStep(AssetStep.collectionDetail);
              }}
              onSend={(nft) => {
                if (!isLoginOnChain) {
                  return loadingTip({ msg: loginOptTip });
                }
                preStepRef.current = AssetStep.NFTDetail;
                setPreStep(AssetStep.NFTDetail);
                // TODO-SA
                onSend(nft as any);
              }}
            />
          )}
          {assetStep === AssetStep.collectionDetail && collectionItem && (
            <CollectionDetailMain
              collectionItem={collectionItem}
              networkType={networkType}
              onBack={() => setAssetStep(AssetStep.overview)}
              onNFTView={(v) => {
                console.log('wfs====12331111');
                preStepRef.current = AssetStep.collectionDetail;
                setPreStep(AssetStep.collectionDetail);
                setAssetStep(AssetStep.NFTDetail);
                setNFTDetail(v);
              }}
            />
          )}

          {assetStep === AssetStep.my && (
            // My
            <MenuListMain
              menuList={myMenuList}
              headerConfig={{
                title: 'Settings',
                onBack: () => setAssetStep(AssetStep.overview),
              }}
              isShowFooter={showDeletion} // TODO delete w
              footerElement={
                <CommonButton
                  className="delete-account-button"
                  type="text"
                  block
                  onClick={() => setAssetStep(AssetStep.deleteAccount)}>
                  Delete Account
                </CommonButton>
              }
            />
          )}
          {assetStep === AssetStep.deleteAccount && (
            <DeleteAccount onBack={() => setAssetStep(AssetStep.my)} onDelete={onDeleteAccount} />
          )}
          {assetStep === AssetStep.guardians && (
            <Guardian
              sandboxId={sandboxId}
              caHash={caHash || ''}
              networkType={networkType}
              originChainId={originChainId}
              accelerateChainId={accelerateChainId}
              isLoginOnChain={isLoginOnChain}
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
          {assetStep === AssetStep.transactionLimits && (
            <PaymentSecurity
              onBack={() => setAssetStep(AssetStep.my)}
              networkType={networkType}
              caHash={caHash || ''}
              onClickItem={async (data) => {
                const res = await getLimitFromContract(data);
                setViewPaymentSecurity({ ...data, ...res });
                setAssetStep(AssetStep.transferSettings);
              }}
            />
          )}
          {assetStep === AssetStep.tokenAllowanceDetail && originalAllowanceItem && (
            <TokenAllowanceDetail
              chainId={originalAllowanceItem.chainId}
              chainImageUrl={originalAllowanceItem.chainImageUrl}
              contractAddress={originalAllowanceItem.contractAddress}
              url={originalAllowanceItem.url}
              icon={originalAllowanceItem.icon}
              name={originalAllowanceItem.name}
              symbolApproveList={originalAllowanceItem.symbolApproveList}
              onBack={() => setAssetStep(AssetStep.tokenAllowance)}
            />
          )}
          {assetStep === AssetStep.tokenAllowance && (
            <TokenAllowance
              onClickItem={(item) => {
                setOriginalAllowanceItem(item);
                setAssetStep(AssetStep.tokenAllowanceDetail);
              }}
              onBack={() => {
                setAssetStep(AssetStep.my);
              }}
            />
          )}
          {assetStep === AssetStep.setSecondaryMailbox && (
            <SetSecondaryMailbox
              onBack={() => {
                setAssetStep(AssetStep.my);
              }}
            />
          )}
          {assetStep === AssetStep.transferSettings && (
            <TransferSettings
              caHash={caHash || ''}
              originChainId={originChainId}
              networkType={networkType}
              sandboxId={sandboxId}
              onBack={() => setAssetStep(AssetStep.transactionLimits)}
              onSuccess={transferSettingsEditBack}
              initData={viewPaymentSecurity}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AssetMain;
