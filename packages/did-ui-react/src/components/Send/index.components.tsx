import { IAssetItemType, OperationTypeEnum } from '@portkey/services';
import { aelf, wallet } from '@portkey/utils';
import CustomSvg from '../CustomSvg';
import TitleWrapper from '../TitleWrapper';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { ReactElement, useCallback, useMemo, useRef, useState } from 'react';
import { getAddressChainId, getAelfAddress, isCrossChain, isDIDAddress } from '../../utils/aelf';
import { AddressCheckError, GuardianApprovedItem } from '../../types';
import { ChainId, SeedTypeEnum } from '@portkey/types';
import ToAccount from './components/ToAccount';
import { AssetTokenExpand, IClickAddressProps, TransactionError, the2ThFailedActivityItemType } from '../types/assets';
import AddressSelector from './components/AddressSelector';
import AmountInput from './components/AmountInput';
import { WalletError, handleErrorMessage, modalMethod, setLoading } from '../../utils';
import { timesDecimals } from '../../utils/converter';
import { ZERO } from '../../constants/misc';
import SendPreview from './components/SendPreview';
import './index.less';
import { useCheckSuffix, useDefaultToken } from '../../hooks/assets';
import { usePortkey } from '../context';
import { DEFAULT_DECIMAL } from '../../constants/assets';
import crossChainTransfer, { intervalCrossChainTransfer } from '../../utils/sandboxUtil/crossChainTransfer';
import crossChainTransferV2 from '../../utils/sandboxUtil/crossChainTransferV2';
import { useFeeByChainId } from '../context/PortkeyAssetProvider/hooks/txFee';
import sameChainTransfer from '../../utils/sandboxUtil/sameChainTransfer';
import getTransferFee from './utils/getTransferFee';
import { useCheckManagerSyncState } from '../../hooks/wallet';
import { MAINNET } from '../../constants/network';
import { PortkeySendProvider } from '../context/PortkeySendProvider';
import clsx from 'clsx';
import transferLimitCheck from '../ModalMethod/TransferLimitCheck';
import { ITransferLimitItemWithRoute } from '../TransferSettingsEdit/index.components';
import { getChain } from '../../hooks/useChainInfo';
import walletSecurityCheck from '../ModalMethod/WalletSecurityCheck';
import singleMessage from '../CustomAnt/message';
import { Modal } from '../CustomAnt';
import GuardianApprovalModal from '../GuardianApprovalModal';
import ThrottleButton from '../ThrottleButton';
import { getOperationDetails } from '../utils/operation.util';
import { getContractBasic } from '@portkey/contracts';
import { AddressTypeEnum, AddressTypeSelect } from '../../components/AddressTypeSelect';
import ToAddressInput from './components/ToAddressInput';
import SupportedExchange from './components/SupportedExchange';

export interface SendProps {
  assetItem: IAssetItemType;
  extraConfig?: SendExtraConfig;
  className?: string;
  wrapperStyle?: React.CSSProperties;
  isErrorTip?: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
  onModifyLimit?: (data: ITransferLimitItemWithRoute) => void;
  onModifyGuardians?: () => void;
}

export type SendExtraConfig = {
  toAccount?: ToAccount;
  amount?: string;
  balance?: string;
  stage?: Stage;
};

export type ToAccount = { name?: string; address: string };

enum Stage {
  'Address',
  'Amount',
  'Preview',
}

const ExceedLimit = 'ExceedLimit';
const WalletIsNotSecure = 'WalletIsNotSecure';

type TypeStageObj = {
  [key in Stage]: { btnText: string; handler: () => void; backFun: () => void; element: ReactElement };
};

function SendContent({
  assetItem,
  className,
  wrapperStyle,
  isErrorTip = true,
  extraConfig,
  onCancel,
  onSuccess,
  onModifyLimit,
  onModifyGuardians,
}: SendProps) {
  const [{ accountInfo, managementAccount, caInfo, caHash, caAddressInfos, originChainId }] = usePortkeyAsset();
  const [{ networkType, chainType, sandboxId }] = usePortkey();
  const [stage, setStage] = useState<Stage>(extraConfig?.stage || Stage.Amount);
  const [approvalVisible, setApprovalVisible] = useState<boolean>(false);
  const isNFT = useMemo(() => Boolean(assetItem.nftInfo), [assetItem]);
  const [txFee, setTxFee] = useState<string>();

  const tokenInfo: AssetTokenExpand = useMemo(
    () => ({
      chainId: assetItem.chainId as ChainId,
      decimals: isNFT ? assetItem.nftInfo?.decimals || '0' : assetItem.tokenInfo?.decimals ?? DEFAULT_DECIMAL,
      address: (isNFT ? assetItem?.nftInfo?.tokenContractAddress : assetItem?.tokenInfo?.tokenContractAddress) || '',
      symbol: assetItem.symbol,
      name: assetItem.symbol,
      imageUrl: isNFT ? assetItem.nftInfo?.imageUrl : '',
      alias: isNFT ? assetItem.nftInfo?.alias : '',
      tokenId: isNFT ? assetItem.nftInfo?.tokenId : '',
      balance: isNFT ? assetItem.nftInfo?.balance : assetItem.tokenInfo?.balance,
      balanceInUsd: isNFT ? '' : assetItem.tokenInfo?.balanceInUsd,
      isSeed: assetItem.nftInfo?.isSeed,
      seedType: assetItem.nftInfo?.seedType,
      label: assetItem?.label,
    }),
    [assetItem, isNFT],
  );

  const defaultFee = useFeeByChainId(tokenInfo.chainId);

  const [toAccount, setToAccount] = useState<ToAccount>(extraConfig?.toAccount || { address: '' });

  const [errorMsg, setErrorMsg] = useState('');
  const [tipMsg, setTipMsg] = useState('');

  const [amount, setAmount] = useState(extraConfig?.amount || '');
  const [balance, setBalance] = useState(extraConfig?.balance || '');

  const defaultToken = useDefaultToken(tokenInfo.chainId);

  const btnDisabled = useMemo(() => {
    if (toAccount.address === '' || (stage === Stage.Amount && amount === '')) return true;
    return false;
  }, [amount, stage, toAccount.address]);

  const isValidSuffix = useCheckSuffix();

  const validateToAddress = useCallback(
    (value: { name?: string; address: string } | undefined) => {
      if (!value) return false;
      const suffix = getAddressChainId(toAccount.address, tokenInfo.chainId);
      if (!isDIDAddress(value.address) || !isValidSuffix(suffix)) {
        setErrorMsg(AddressCheckError.recipientAddressIsInvalid);
        return false;
      }
      const selfAddress = caInfo?.[tokenInfo.chainId as ChainId]?.caAddress || '';
      if (wallet.isEqAddress(selfAddress, getAelfAddress(toAccount.address)) && suffix === tokenInfo.chainId) {
        setErrorMsg(AddressCheckError.equalIsValid);
        return false;
      }
      setErrorMsg('');
      return true;
    },
    [caInfo, isValidSuffix, toAccount.address, tokenInfo.chainId],
  );

  const getTranslationInfo = useCallback(
    async (num = ''): Promise<string | void> => {
      try {
        if (!toAccount?.address) throw 'No toAccount';
        const privateKey = managementAccount?.privateKey;
        if (!privateKey) throw WalletError.invalidPrivateKey;
        if (!caHash) throw 'Please login';
        const _caAddress = caAddressInfos?.filter((caAdd) => caAdd.chainId === tokenInfo?.chainId)?.[0];
        const feeRes = await getTransferFee({
          caAddress: _caAddress?.caAddress || '',
          chainId: tokenInfo.chainId,
          managerAddress: managementAccount.address,
          toAddress: toAccount?.address,
          privateKey,
          chainType,
          token: tokenInfo,
          caHash,
          amount: timesDecimals(num || amount, tokenInfo.decimals).toNumber(),
        });
        return feeRes;
      } catch (error) {
        const _error = handleErrorMessage(error);
        console.log('getFee===error', _error);
      }
    },
    [amount, caHash, chainType, managementAccount, toAccount?.address, tokenInfo, caAddressInfos],
  );

  const btnOutOfFocus = useCallback(() => {
    // fixed - button focus style when mobile
    if (typeof document !== 'undefined') document.body.focus();
  }, []);

  const oneTimeApprovalList = useRef<GuardianApprovedItem[]>([]);
  const { onApprovalSuccess, sendTransfer } = useMemo(() => {
    const onApprovalSuccess = async (approveList: any[]) => {
      try {
        oneTimeApprovalList.current = approveList;
        if (Array.isArray(approveList) && approveList.length > 0) {
          setApprovalVisible(false);
          if (stage === Stage.Amount) {
            setStage(Stage.Preview);
          } else if (stage === Stage.Preview) {
            await sendTransfer();
          }
        } else {
          throw Error('approve failed, please try again');
        }
      } catch (error) {
        throw Error('approve failed, please try again');
      }
    };

    const sendTransfer = async () => {
      try {
        if (!managementAccount?.privateKey || !caHash) return;

        setLoading(true);

        const chainId = tokenInfo.chainId;
        const chainInfo = await getChain(chainId);
        if (!chainInfo) throw 'Please check network connection and chainId';
        const account = aelf.getWallet(managementAccount?.privateKey);
        const tokenContract = await getContractBasic({
          rpcUrl: chainInfo.endPoint,
          account,
          contractAddress: tokenInfo.address,
          chainType,
        });

        if (isCrossChain(toAccount.address, tokenInfo.chainId)) {
          await crossChainTransferV2({
            tokenContract,
            sandboxId,
            chainId: tokenInfo.chainId,
            chainType,
            privateKey: managementAccount?.privateKey,
            tokenInfo,
            caHash: caHash || '',
            amount: timesDecimals(amount, tokenInfo.decimals).toNumber(),
            toAddress: toAccount.address,
            toChainId: 'AELF',
            guardiansApproved: oneTimeApprovalList.current,
          });
        } else {
          console.log('sameChainTransfers==sendHandler');
          await sameChainTransfer({
            sandboxId,
            chainId: tokenInfo.chainId,
            chainType,
            privateKey: managementAccount?.privateKey,
            tokenInfo,
            caHash: caHash || '',
            amount: timesDecimals(amount, tokenInfo.decimals).toNumber(),
            toAddress: toAccount.address,
            guardiansApproved: oneTimeApprovalList.current,
          });
        }
        singleMessage.success('success');
        onSuccess?.();
      } catch (error: any) {
        console.log('sendHandler==error', error);
        if (!error?.type) return singleMessage.error(handleErrorMessage(error));
        if (error.type === 'managerTransfer') {
          return singleMessage.error(handleErrorMessage(error));
        } else if (error.type === 'crossChainTransfer') {
          console.log('addFailedActivity', error);

          singleMessage.error(handleErrorMessage(error));
        } else {
          singleMessage.error(handleErrorMessage(error));
        }
      } finally {
        setLoading(false);
      }
    };

    return { onApprovalSuccess, sendTransfer };
  }, [
    amount,
    caHash,
    chainType,
    managementAccount?.privateKey,
    onSuccess,
    sandboxId,
    stage,
    toAccount.address,
    tokenInfo,
  ]);

  const handleOneTimeApproval = useCallback(async () => {
    setApprovalVisible(true);
  }, []);

  const handleCheckTransferLimit = useCallback(async () => {
    const chainInfo = await getChain(tokenInfo.chainId);
    const privateKey = managementAccount?.privateKey;
    if (!privateKey) throw WalletError.invalidPrivateKey;
    if (!caHash) throw 'Please login';

    const res = await transferLimitCheck({
      rpcUrl: chainInfo?.endPoint || '',
      caContractAddress: chainInfo?.caContractAddress || '',
      caHash: caHash,
      chainId: tokenInfo.chainId,
      symbol: tokenInfo.symbol,
      amount: amount,
      decimals: tokenInfo.decimals,
      businessFrom: {
        module: 'send',
        extraConfig: {
          toAccount,
          amount,
          balance,
          stage,
        },
      },
      balance,
      chainType,
      tokenContractAddress: tokenInfo?.address || '',
      ownerCaAddress: caInfo?.[tokenInfo.chainId]?.caAddress || '',
      onOneTimeApproval: handleOneTimeApproval,
      onModifyTransferLimit: onModifyLimit,
    });

    return res;
  }, [
    amount,
    balance,
    caHash,
    caInfo,
    chainType,
    handleOneTimeApproval,
    managementAccount?.privateKey,
    onModifyLimit,
    stage,
    toAccount,
    tokenInfo?.address,
    tokenInfo.chainId,
    tokenInfo.decimals,
    tokenInfo.symbol,
  ]);

  const sendHandler = useCallback(async () => {
    if (!oneTimeApprovalList.current || oneTimeApprovalList.current.length === 0) {
      try {
        if (!managementAccount?.privateKey || !caHash) return;
        if (!tokenInfo) throw 'No Symbol info';
        setLoading(true);

        // transfer limit check
        const limitRes = await handleCheckTransferLimit();
        if (!limitRes) return setLoading(false);
      } catch (error: any) {
        setLoading(false);
        singleMessage.error(handleErrorMessage(error));
      }
    }
    await sendTransfer();
  }, [caHash, handleCheckTransferLimit, managementAccount?.privateKey, sendTransfer, tokenInfo]);

  const checkManagerSyncState = useCheckManagerSyncState();
  const handleCheckPreview = useCallback(async () => {
    try {
      setLoading(true);
      if (!ZERO.plus(amount).toNumber()) return 'Please input amount';
      if (!caHash || !managementAccount?.address) return 'Please Login';

      // CHECK 1: manager sync
      const _isManagerSynced = await checkManagerSyncState(tokenInfo.chainId, caHash, managementAccount?.address);
      if (!_isManagerSynced) {
        return 'Synchronizing on-chain account information...';
      }

      // CHECK 2: wallet security
      const res = await walletSecurityCheck({
        originChainId: originChainId,
        targetChainId: tokenInfo.chainId,
        caHash: caHash || '',
        onOk: onModifyGuardians,
      });
      if (!res) return WalletIsNotSecure;

      // CHECK 3: insufficient balance
      if (!isNFT) {
        if (timesDecimals(amount, tokenInfo.decimals).isGreaterThan(balance)) {
          return TransactionError.TOKEN_NOT_ENOUGH;
        }
        if (isCrossChain(toAccount.address, tokenInfo.chainId) && tokenInfo.symbol === defaultToken.symbol) {
          if (ZERO.plus(defaultFee.crossChain).isGreaterThanOrEqualTo(amount)) {
            return TransactionError.CROSS_NOT_ENOUGH;
          }
        }
      } else if (isNFT) {
        if (ZERO.plus(amount).isGreaterThan(balance)) {
          return TransactionError.NFT_NOT_ENOUGH;
        }
      } else {
        return 'input error';
      }

      // CHECK 4: transfer limit
      const limitRes = await handleCheckTransferLimit();
      if (!limitRes) return ExceedLimit;

      // CHECK 5: tx fee
      const fee = await getTranslationInfo();
      console.log(fee, 'fee===getTranslationInfo');
      if (fee) {
        setTxFee(fee);
      } else {
        return TransactionError.FEE_NOT_ENOUGH;
      }
      return '';
    } catch (error: any) {
      console.log('checkTransactionValue===', error);
      return TransactionError.FEE_NOT_ENOUGH;
    } finally {
      setLoading(false);
    }
  }, [
    amount,
    balance,
    caHash,
    checkManagerSyncState,
    defaultFee.crossChain,
    defaultToken.symbol,
    getTranslationInfo,
    handleCheckTransferLimit,
    isNFT,
    managementAccount?.address,
    onModifyGuardians,
    originChainId,
    toAccount.address,
    tokenInfo.chainId,
    tokenInfo.decimals,
    tokenInfo.symbol,
  ]);

  const StageObj: TypeStageObj = useMemo(
    () => ({
      0: {
        btnText: 'Next',
        handler: async () => {
          const res = validateToAddress(toAccount);

          if (!res) return;
          if (!toAccount) return;
          if (isCrossChain(toAccount.address, tokenInfo?.chainId ?? 'AELF')) {
            return await modalMethod({
              width: 320,
              content: 'This is a cross-chain transaction.',
              className: 'portkey-ui-cross-modal',
              autoFocusButton: null,
              icon: null,
              centered: true,
              okText: 'Continue',
              cancelText: 'Cancel',
              onOk: () => setStage(Stage.Amount),
            });
          }
          btnOutOfFocus();
          setStage(Stage.Amount);
        },
        backFun: () => {
          onCancel?.();
        },
        element: (
          <AddressSelector
            networkType={networkType}
            onClick={(account: IClickAddressProps) => {
              // from RecentList: Not recent contacts, not clickable
              if (account.isDisable) return;
              const value = {
                name: account?.name,
                address: `ELF_${account.address}_${account?.addressChainId || account?.chainId}`,
              };
              setToAccount(value);
            }}
            chainId={tokenInfo.chainId}
          />
        ),
      },
      1: {
        btnText: 'Preview',
        handler: async () => {
          const res = await handleCheckPreview();
          console.log('handleCheckPreview res', res);
          if (res === ExceedLimit || res === WalletIsNotSecure) return;
          if (!res) {
            setTipMsg('');
            setStage(Stage.Preview);
          } else {
            setTipMsg(res);
          }
          btnOutOfFocus();
        },
        backFun: () => {
          setStage(Stage.Address);
          setAmount('');
          setTipMsg('');
          oneTimeApprovalList.current = [];
        },
        element: (
          <>
            <AddressTypeSelect value={AddressTypeEnum.NON_EXCHANGE} onChangeValue={() => console.log('aa')} />
            <SupportedExchange />
            <AmountInput
              type={isNFT ? 'nft' : 'token'}
              fromAccount={{
                address: caInfo?.[tokenInfo.chainId]?.caAddress || '',
                AESEncryptPrivateKey: managementAccount?.privateKey || '',
              }}
              toAccount={{
                address: toAccount.address,
              }}
              value={amount}
              errorMsg={tipMsg}
              token={tokenInfo}
              onChange={({ amount, balance }) => {
                setAmount(amount);
                setBalance(balance);
              }}
              getTranslationInfo={getTranslationInfo}
              setErrorMsg={setTipMsg}
            />
          </>
        ),
      },
      2: {
        btnText: 'Send',
        handler: () => {
          sendHandler();
          btnOutOfFocus();
        },
        backFun: () => {
          setStage(Stage.Amount);
        },
        element: (
          <SendPreview
            isMainnet={networkType === MAINNET}
            caAddress={caInfo?.[tokenInfo.chainId].caAddress || ''}
            nickname={accountInfo?.nickName}
            type={!isNFT ? 'token' : 'nft'}
            toAccount={toAccount}
            amount={amount}
            balanceInUsd={tokenInfo.balanceInUsd}
            symbol={tokenInfo?.label || tokenInfo?.symbol || ''}
            label={tokenInfo?.label || ''}
            alias={tokenInfo.alias || ''}
            imageUrl={tokenInfo.imageUrl || ''}
            decimals={tokenInfo.decimals}
            isSeed={tokenInfo.isSeed || false}
            seedType={tokenInfo.seedType || SeedTypeEnum.NULL}
            chainId={tokenInfo.chainId || ''}
            transactionFee={txFee || ''}
            isCross={isCrossChain(toAccount.address, tokenInfo.chainId)}
            tokenId={tokenInfo.tokenId || ''}
            crossChainFee={defaultFee.crossChain}
          />
        ),
      },
    }),
    [
      accountInfo?.nickName,
      amount,
      caInfo,
      defaultFee.crossChain,
      getTranslationInfo,
      handleCheckPreview,
      isNFT,
      managementAccount?.privateKey,
      networkType,
      onCancel,
      sendHandler,
      btnOutOfFocus,
      tipMsg,
      toAccount,
      tokenInfo,
      txFee,
      validateToAddress,
    ],
  );

  return (
    <div style={wrapperStyle} className={clsx('portkey-ui-send-wrapper', className)}>
      <TitleWrapper
        leftElement={<CustomSvg type={'BackLeft'} />}
        className="page-title"
        title={`Send ${!isNFT ? tokenInfo?.label || tokenInfo.symbol : ''}`}
        leftCallBack={() => {
          StageObj[stage].backFun();
        }}
      />
      {stage !== Stage.Preview && <ToAddressInput toAccount={toAccount} setToAccount={setToAccount} />}
      <div className="stage-ele">{StageObj[stage].element}</div>
      <div className="btn-wrap">
        <ThrottleButton disabled={btnDisabled} className="stage-btn" type="primary" onClick={StageObj[stage].handler}>
          {StageObj[stage].btnText}
        </ThrottleButton>
      </div>

      <GuardianApprovalModal
        open={approvalVisible}
        caHash={caHash || ''}
        originChainId={originChainId}
        targetChainId={tokenInfo.chainId}
        operationType={OperationTypeEnum.transferApprove}
        isErrorTip={isErrorTip}
        sandboxId={sandboxId}
        networkType={networkType}
        onClose={() => setApprovalVisible(false)}
        onBack={() => setApprovalVisible(false)}
        onApprovalSuccess={onApprovalSuccess}
        operationDetails={getOperationDetails(OperationTypeEnum.transferApprove, {
          symbol: tokenInfo.symbol,
          amount: timesDecimals(amount, tokenInfo.decimals).toNumber(),
          toAddress: toAccount.address,
        })}
        officialWebsiteShow={{ amount: amount, symbol: tokenInfo.symbol }}
      />
    </div>
  );
}

export default function SendMain(props: SendProps) {
  return (
    <PortkeySendProvider>
      <SendContent {...props} />
    </PortkeySendProvider>
  );
}
