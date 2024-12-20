import { aelf, wallet } from '@portkey/utils';
import { IAssetItemType, ITransferLimitItem, OperationTypeEnum } from '@portkey/services';
import CustomSvg from '../CustomSvg';
import TitleWrapper from '../TitleWrapper';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { ReactElement, useCallback, useMemo, useRef, useState } from 'react';
import { getAddressChainId, getAelfAddress, isCrossChain, isDIDAddress, isDIDAelfAddress } from '../../utils/aelf';
import { AddressCheckError, GuardianApprovedItem } from '../../types';
import { ChainId, SeedTypeEnum } from '@portkey/types';
import ToAccount from './components/ToAccount';
import { AssetTokenExpand, IClickAddressProps, TransactionError, the2ThFailedActivityItemType } from '../types/assets';
import AddressSelector from './components/AddressSelector';
import AmountInput from './components/AmountInput';
import { WalletError, handleErrorMessage, modalMethod, setLoading } from '../../utils';
import { formatAmountShow, timesDecimals } from '../../utils/converter';
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
import { getChain } from '../../hooks/useChainInfo';
import walletSecurityCheck from '../ModalMethod/WalletSecurityCheck';
import singleMessage from '../CustomAnt/message';
import GuardianApprovalModal from '../GuardianApprovalModal';
import ThrottleButton from '../ThrottleButton';
import { getOperationDetails } from '../utils/operation.util';
import { getContractBasic } from '@portkey/contracts';
import { AddressTypeEnum, AddressTypeSelect } from '../../components/AddressTypeSelect';
import ToAddressInput, { InputStepEnum, SendAssetTypeEnum } from './components/ToAddressInput';
import SupportedExchange from './components/SupportedExchange';
import { ITransferLimitItemWithRoute } from '../../types/transfer';
import { useDebounce } from '../../hooks/debounce';
import useLockCallback from '../../hooks/useLockCallback';
import { divDecimals } from '@etransfer/utils';
import { getTransactionFee } from '../../utils/sandboxUtil/getTransactionFee';
import { useTokenPrice } from '../context/PortkeyAssetProvider/hooks';
import { useEffectOnce } from 'react-use';
import { WarningKey } from '../../constants/error';
import { INetworkItem } from './components/SelectNetwork';
import { TransferTypeEnum } from '../../types/send';
import { useCrossTransferByEtransfer } from '../../hooks/useWithdrawByETransfer';
import useGetEBridgeConfig from '../../hooks/eBridge';
import { EBridge } from '../../utils/eBridge';
import Loading from '../Loading';
import { getLimitTips, getSmallerValue } from '../../utils/send';

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
const CheckPass = 'CheckPass';

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
  const [{ accountInfo, managementAccount, caInfo, caHash, caAddressInfos, originChainId, tokenListInfoV2, pin }] =
    usePortkeyAsset();
  console.log('tokenListInfoV2 is::', tokenListInfoV2, 'assetItem', assetItem, 'extraConfig', extraConfig);
  const [{ networkType, chainType, sandboxId }] = usePortkey();
  const [stage, setStage] = useState<Stage>(extraConfig?.stage || Stage.Amount);
  const [approvalVisible, setApprovalVisible] = useState<boolean>(false);
  const isNFT = useMemo(() => Boolean(assetItem.nftInfo), [assetItem]);
  const [txFee, setTxFee] = useState<string>();
  const [inputStep, setInputStep] = useState<InputStepEnum>(InputStepEnum.input);
  const [warning, setWarning] = useState<WarningKey | undefined>();
  const [chainList, setChainList] = useState<INetworkItem[]>([]);
  const [targetNetwork, setTargetNetwork] = useState<INetworkItem>();
  const recommendEBridgeInfo = {};
  const recommendEtransferinfo = {};

  const [isCheckAddressFinish, setIsCheckAddressFinish] = useState(false);

  // revamp app logic start
  const price = useTokenPrice(assetItem.symbol);
  const assetInfo: AssetTokenExpand = useMemo(
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
  const symbolPrice = useTokenPrice(tokenInfo.symbol);

  // const assetInfo = useMemo(() => (assetItem.nftInfo ? assetItem.nftInfo : assetItem.tokenInfo), [assetItem]);
  const checkManagerSyncState = useCheckManagerSyncState();
  const [sendNumber, setSendNumber] = useState<string>(''); // tokenNumber  like 100
  const [sendUsdNumber, setSendUsdNumber] = useState<string>(''); // tokenNumber  like 100
  const debounceSendNumber = useDebounce(sendNumber, 500);
  const [maxAmountSend, setMaxAmountSend] = useState<string>(
    formatAmountShow(divDecimals(assetInfo?.balance, assetInfo?.decimals)),
  );
  const maxAmountSendUsd = useMemo(() => ZERO.plus(maxAmountSend).times(price).toFixed(2), [maxAmountSend, price]);
  const [errorMessage, setErrorMessage] = useState('');
  const [balance, setBalance] = useState<string>(assetInfo?.balance || '');
  const { max: maxFee, crossChain: crossFee } = useFeeByChainId(assetInfo?.chainId);
  // const { getEtransferMaxFee } = useEtransferFee(assetInfo?.chainId);
  const onGetMaxAmount = useLockCallback(async () => {
    if (!balance) {
      return setMaxAmountSend('0');
    }

    const balanceBN = divDecimals(balance, assetInfo?.decimals);
    const balanceStr = balanceBN.toString();

    // balance 0
    if (divDecimals(balance, assetInfo?.decimals).isEqualTo(0)) {
      return setMaxAmountSend('0');
    }

    // if other tokens
    if (assetItem?.symbol !== defaultToken.symbol) {
      return setMaxAmountSend(divDecimals(balance, assetInfo?.decimals || '0').toFixed());
    }

    // elf <= maxFee
    if (divDecimals(balance, assetInfo?.decimals).isLessThanOrEqualTo(maxFee)) {
      return setMaxAmountSend(divDecimals(balance, assetInfo?.decimals || '0').toFixed());
    }

    // const isAELFCross = !!(selectedToContact.chainId && selectedToContact.chainId !== assetInfo.chainId);
    let fee;
    try {
      fee = await getTranslationInfo();
      // fee = await getTransactionFee(isAELFCross, divDecimals(balance, assetInfo?.decimals || 0).toFixed());
    } catch (error) {
      fee = '0';
      console.log('FEE ERROR');
    }
    const etransferFee = 0;
    // Todo etransfer logic ?
    // const etransferFee = await getEtransferMaxFee({ amount: balanceStr, toInfo, tokenInfo: assetInfo });

    const _max = fee
      ? balanceBN.minus(etransferFee)
      : ZERO.plus(divDecimals(balance, assetInfo.decimals)).minus(maxFee).minus(etransferFee);
    console.log('cal max', _max.gt(ZERO) ? _max.toFixed() : '0');
    setMaxAmountSend(_max.gt(ZERO) ? _max.toFixed() : '0');
  }, [balance, assetInfo]);
  const onPressMax = useCallback(async () => {
    try {
      // setLoading(true);
      // check is SYNCHRONIZING
      const _isManagerSynced = await checkManagerSyncState(
        (assetItem.chainId as ChainId) || 'AELF',
        caHash || '',
        managementAccount?.address || '',
      );
      console.log(
        '_isManagerSynced is::',
        _isManagerSynced,
        'maxAmountSend',
        maxAmountSend,
        'maxAmountSendUsd',
        maxAmountSendUsd,
      );
      if (!_isManagerSynced) {
        return singleMessage.warn(TransactionError.SYNCHRONIZING);
      }

      setSendNumber(maxAmountSend);
      setSendUsdNumber(maxAmountSendUsd);
      setErrorMessage('');
    } catch (err) {
      console.log('max err!!', err);
    } finally {
      // setLoading(false);
    }
  }, [checkManagerSyncState, assetItem.chainId, caHash, managementAccount?.address, maxAmountSend, maxAmountSendUsd]);
  useEffectOnce(() => {
    onGetMaxAmount();
  });
  // revamp app logic end
  const [networkFee, setNetworkFee] = useState<string>();
  const [transferType, setTransferType] = useState(TransferTypeEnum.GENERAL_CROSS_CHAIN);
  const crossTransferByEtransfer = useCrossTransferByEtransfer(pin);
  const { getAELFChainInfoConfig, getEVMChainInfoConfig, getTokenConfig } = useGetEBridgeConfig();
  const [networkFeeUnit, setNetworkFeeUnit] = useState<string>('');
  const [transactionFee, setTransactionFee] = useState<string>('');
  const [transactionUnit, setTransactionUnit] = useState<string>('');
  const [receiveAmount, setReceiveAmount] = useState<string>('');
  const [receiveAmountUsd, setReceiveAmountUsd] = useState<string>('');

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

  const [toAccount, setToAccount] = useState<ToAccount>(
    extraConfig?.toAccount || { address: '2dsSgFPvvLTwGXZVCzLwgRJFNtusceRAmcwbAmArjHtJjtEG9u' },
  );

  const [errorMsg, setErrorMsg] = useState('');
  const [tipMsg, setTipMsg] = useState('');

  const [amount, setAmount] = useState(extraConfig?.amount || '');
  const [usdAmount, setUSDAmount] = useState('');
  // const [balance, setBalance] = useState(extraConfig?.balance || '');

  const defaultToken = useDefaultToken(tokenInfo.chainId);

  const btnDisabled = useMemo(() => {
    if (toAccount.address === '' || (stage === Stage.Amount && amount === '')) return true;
    return false;
  }, [amount, stage, toAccount.address]);

  const isValidSuffix = useCheckSuffix();
  const caAddress = useMemo(() => caInfo?.[tokenInfo.chainId as ChainId]?.caAddress || '', [caInfo, tokenInfo.chainId]);

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
        const _transferType = TransferTypeEnum.GENERAL_SAME_CHAIN;

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

        const portkeyContract = await getContractBasic({
          rpcUrl: chainInfo.endPoint,
          contractAddress: chainInfo.caContractAddress,
          account,
          chainType,
        });

        if (_transferType === TransferTypeEnum.GENERAL_SAME_CHAIN) {
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
        } else if (_transferType === TransferTypeEnum.GENERAL_CROSS_CHAIN) {
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
        } else if (_transferType === TransferTypeEnum.E_TRANSFER) {
          // TODO: change ite
          // let network = '';
          // if (isDIDAelfAddress(toAccount.address)) {
          //   const arr = toAccount?.address.split('_');
          //   network = arr[arr.length - 1];
          // } else {
          // network = targetNetwork?.network || toAccount?.network || String(toAccount?.chainId);
          // }

          const crossTransferByEtransferResult = await crossTransferByEtransfer.withdraw({
            chainId: chainInfo.chainId,
            tokenContractAddress: tokenInfo.address,
            portkeyContractAddress: chainInfo.caContractAddress,
            toAddress: toAccount.address,
            amount: String(amount),
            // TODO: change it
            network: 'AELF',
            tokenInfo: {
              symbol: tokenInfo.symbol,
              decimals: Number(tokenInfo.decimals),
              address: tokenInfo.address,
            },
            isCheckSymbol: false,
            privateKey: managementAccount.privateKey,
          });

          console.log('crossTransferByEtransferResult', crossTransferByEtransferResult);
        } else if (transferType === TransferTypeEnum.E_BRIDGE) {
          const fromChainInfo = getAELFChainInfoConfig(tokenInfo.chainId);
          // const toChainInfo = getEVMChainInfoConfig(targetNetwork?.network || tokenInfo?.network || 'SETH');
          // TODO: change it
          const toChainInfo = getEVMChainInfoConfig('SETH');
          const tokenEBridgeInfo = getTokenConfig(tokenInfo.symbol);
          const bridge = new EBridge({
            fromChainInfo,
            toChainInfo,
            tokenInfo: tokenEBridgeInfo,
          });

          const fee = await bridge.getELFFee();
          const needElfBalance =
            tokenInfo.symbol === defaultToken.symbol
              ? timesDecimals(amount, defaultToken.decimals).plus(fee).toString()
              : fee;

          // TODO: change it
          // const elfBalance = (await getElfBalance()) || '';
          // if (ZERO.plus(needElfBalance).isGreaterThan(elfBalance)) {

          //   throw {
          //     type: ErrorType.NO_TOAST,
          //     error: 'No enough fee',
          //   };
          // }

          const limit = bridge.getLimit();
          console.log('fee,limit', fee, limit);

          const createReceiptResult = await bridge.createReceipt({
            chainId: tokenInfo.chainId,
            tokenContractAddress: tokenInfo?.address || '',
            targetAddress: toAccount.address,
            amount: String(amount),
            owner: caInfo?.[tokenInfo.chainId]?.caAddress || '',
            caHash,
            portkeyContractAddress: '',
            privateKey: managementAccount.privateKey || '',
          });
          console.log(createReceiptResult, 'createReceiptResult===EBridge');
        }

        // singleMessage.success('success');
        // onSuccess?.();
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
    caInfo,
    chainType,
    crossTransferByEtransfer,
    defaultToken.decimals,
    defaultToken.symbol,
    getAELFChainInfoConfig,
    getEVMChainInfoConfig,
    getTokenConfig,
    managementAccount.privateKey,
    sandboxId,
    stage,
    toAccount.address,
    tokenInfo,
    transferType,
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

  // const checkManagerSyncState = useCheckManagerSyncState();
  const handleCheckPreview = useCallback(async (): any => {
    try {
      setLoading(true);
      if (!ZERO.plus(amount).toNumber()) return { checkResult: 'Please input amount' };
      if (!caHash || !managementAccount?.address) return { checkResult: 'Please Login' };

      // CHECK 1: manager sync
      const _isManagerSynced = await checkManagerSyncState(tokenInfo.chainId, caHash, managementAccount?.address);
      if (!_isManagerSynced) {
        return {
          checkResult: 'Synchronizing on-chain account information...',
        };
      }

      // CHECK 2: wallet security
      const res = await walletSecurityCheck({
        originChainId: originChainId,
        targetChainId: tokenInfo.chainId,
        caHash: caHash || '',
        onOk: onModifyGuardians,
      });
      if (!res) return { checkResult: WalletIsNotSecure };

      // CHECK 3: insufficient balance
      if (!isNFT) {
        if (timesDecimals(amount, tokenInfo.decimals).isGreaterThan(balance)) {
          return { checkResult: TransactionError.TOKEN_NOT_ENOUGH };
        }
        if (isCrossChain(toAccount.address, tokenInfo.chainId) && tokenInfo.symbol === defaultToken.symbol) {
          if (ZERO.plus(defaultFee.crossChain).isGreaterThanOrEqualTo(amount)) {
            return { checkResult: TransactionError.CROSS_NOT_ENOUGH };
          }
        }
      } else if (isNFT) {
        if (ZERO.plus(amount).isGreaterThan(balance)) {
          return { checkResult: TransactionError.NFT_NOT_ENOUGH };
        }
      } else {
        return { checkResult: 'input error' };
      }

      // CHECK 4: transfer limit  (just for aelf transfer)
      const limitRes = await handleCheckTransferLimit();
      if (!limitRes) return { checkResult: ExceedLimit };

      // CHECK 5: check transfer type
      let _transferType = TransferTypeEnum.GENERAL_SAME_CHAIN;
      let _networkFee: string | undefined;
      let _networkFeeUnit: string | undefined;
      let _transactionFee: string | undefined;
      let _transactionUnit: string | undefined;
      let _receiveAmount: string | undefined;
      let _receiveAmountUsd: string | undefined;

      const sendBigNumber = timesDecimals(amount, assetInfo.decimals || '0');

      // if isRecommendEtransfer(to evm) fee check
      if (Math.random() > 0.5) {
        try {
          const { withdrawInfo } = await crossTransferByEtransfer.withdrawPreview({
            symbol: tokenInfo.symbol,
            address: tokenInfo.address,
            chainId: tokenInfo.chainId,
            amount: amount,
            network: targetNetwork?.network || '',
          });
          console.log('withdrawInfo result', withdrawInfo);
          _networkFee = withdrawInfo?.aelfTransactionFee;
          const maxAmount = Number(withdrawInfo?.maxAmount);
          const minAmount = Number(withdrawInfo?.minAmount);
          _transactionFee = withdrawInfo.transactionFee;
          _transactionUnit = withdrawInfo.transactionUnit;
          const isEtransferCrossInLimit = Number(amount) >= minAmount && Number(amount) <= maxAmount;
          // TODO: change it

          if (isEtransferCrossInLimit) {
            _receiveAmount = withdrawInfo?.receiveAmount;
            _receiveAmountUsd = withdrawInfo?.receiveAmountUsd;
            _transferType = TransferTypeEnum.E_TRANSFER;

            return {
              checkResult: CheckPass,
              networkFee,
              networkFeeUnit,
              receiveAmount,
              receiveAmountUsd,
              transactionFee,
              transactionUnit,
              transferType,
              targetNetwork: targetNetwork,
            };
          } else {
            return {
              checkResult: 'etansfer err',
            };
          }
        } catch (error) {
          console.log('etansfer err', error);
          console.log('checkCanPreview 14');
          return { status: false };
        } finally {
          // Loading.hide();
        }
      }

      // if isRecommendEBridge(to evm) fee check
      if (Math.random() > 0.4) {
        try {
          const fromChainInfo = getAELFChainInfoConfig(assetInfo.chainId);
          const toChainInfo = getEVMChainInfoConfig(targetNetwork?.network || '');
          const tokenInfo = getTokenConfig(assetInfo.symbol);
          const bridge = new EBridge({
            fromChainInfo,
            toChainInfo,
            tokenInfo,
          });

          _receiveAmount = amount;
          _receiveAmountUsd = ZERO.plus(sendNumber).times(price).toString();

          // fee
          const f = await bridge.getELFFee();

          // limit
          const limit = await bridge.getLimit();
          const targetLimit = getSmallerValue(limit.remain, limit.currentCapacity);
          if (limit.isEnable && sendBigNumber.isGreaterThan(targetLimit)) {
            console.log('checkCanPreview 16');
            return setErrorMessage(getLimitTips(assetInfo.symbol, '0', formatAmountShow(targetLimit)));
          }
          _transactionFee = divDecimals(f, defaultToken.decimals).toString();
          _transactionUnit = 'ELF';
          _transferType = TransferTypeEnum.E_BRIDGE;
          // TODO: change it
          if (ZERO.plus(1000).lt(sendNumber)) {
            // TODO: change it
          }
          return {
            checkResult: CheckPass,
            networkFee,
            networkFeeUnit,
            transactionFee,
            transactionUnit,
            receiveAmount,
            receiveAmountUsd,
            transferType,
          };
        } catch (error) {
          console.log('err', error);
          console.log('checkCanPreview 18');
          return { checkResult: 'eBridge false' };
        }
      }

      const isAELFCross = true;
      const isSupportCross = true;

      // SameChain or CrossChain in aelf
      // TODO: change it
      if (isAELFCross && isSupportCross) {
        let isEtransferCrossInLimit = false;
        try {
          const { withdrawInfo } = await crossTransferByEtransfer.withdrawPreview({
            symbol: assetInfo.symbol,
            address: toAccount.address,
            chainId: assetInfo.chainId,
            amount: sendNumber,
            network,
          });

          _transactionFee = withdrawInfo?.aelfTransactionFee;
          const maxAmount = Number(withdrawInfo?.maxAmount);
          const minAmount = Number(withdrawInfo?.minAmount);
          _transactionFee = withdrawInfo.transactionFee;
          _transactionUnit = withdrawInfo.transactionUnit;
          isEtransferCrossInLimit = Number(sendNumber) >= minAmount && Number(sendNumber) <= maxAmount;

          // eTransfer
          if (isEtransferCrossInLimit) {
            _receiveAmount = withdrawInfo?.receiveAmount;
            _receiveAmountUsd = withdrawInfo?.receiveAmountUsd;
            _transferType = TransferTypeEnum.E_TRANSFER;
          }
        } catch (error) {
          console.log('isEtransferCrossInLimit', error);
          isEtransferCrossInLimit = false;
        }
        // GENERAL_CROSS_CHAIN
        if (!isEtransferCrossInLimit) {
          _transferType = TransferTypeEnum.GENERAL_CROSS_CHAIN;
          //       TODO: change it
          // _networkFee = await getTransactionFee(isAELFCross, amount);
          _networkFeeUnit = 'ELF';
        }
      } else {
        // TODO: change it
        // _networkFee = await getTransactionFee(isAELFCross, amount);
        _networkFeeUnit = 'ELF';
        _transferType = isAELFCross ? TransferTypeEnum.GENERAL_CROSS_CHAIN : TransferTypeEnum.GENERAL_SAME_CHAIN;
      }

      // CHECK 6: tx fee
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
    assetInfo.label,
    assetInfo.symbol,
    balance,
    caHash,
    checkManagerSyncState,
    crossTransferByEtransfer,
    defaultFee.crossChain,
    defaultToken.symbol,
    getTranslationInfo,
    handleCheckTransferLimit,
    isNFT,
    managementAccount?.address,
    networkFee,
    networkFeeUnit,
    onModifyGuardians,
    originChainId,
    receiveAmount,
    receiveAmountUsd,
    targetNetwork,
    toAccount.address,
    tokenInfo.address,
    tokenInfo.chainId,
    tokenInfo.decimals,
    tokenInfo.symbol,
    transactionFee,
    transactionUnit,
    transferType,
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
          if (res?.checkResult === ExceedLimit || res?.checkResult === WalletIsNotSecure) return;
          if (res?.checkResult === CheckPass) {
            res?.networkFee && setNetworkFee(res?.networkFee);
            res?.networkFeeUnit && setNetworkFeeUnit(res?.networkFeeUnit);
            res?.receiveAmount && setReceiveAmount(res?.receiveAmount);
            res?.receiveAmountUsd && setReceiveAmountUsd(res?.receiveAmountUsd);
            res?.transactionFee && setTransactionFee(res?.transactionFee);
            res?.transactionUnit && setTransactionUnit(res?.transactionUnit);
            setTipMsg('');
            setStage(Stage.Preview);
          } else {
            setTipMsg(res?.checkResult);
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
              value={sendNumber}
              usdValue={sendUsdNumber}
              setValue={setSendNumber}
              setUsdValue={setSendUsdNumber}
              token={tokenInfo}
              onChange={({ amount, balance }) => {
                setSendNumber(amount);
                setBalance(balance);
              }}
              getTranslationInfo={getTranslationInfo}
              setErrorMsg={setTipMsg}
              warningTip={errorMessage}
              onPressMax={onPressMax}
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
      networkType,
      tokenInfo,
      isNFT,
      caInfo,
      managementAccount?.privateKey,
      toAccount,
      sendNumber,
      sendUsdNumber,
      getTranslationInfo,
      errorMessage,
      onPressMax,
      accountInfo?.nickName,
      amount,
      txFee,
      defaultFee.crossChain,
      validateToAddress,
      btnOutOfFocus,
      onCancel,
      handleCheckPreview,
      setBalance,
      sendHandler,
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
      {stage !== Stage.Preview && (
        <ToAddressInput
          caAddress={caAddress}
          toAccount={toAccount}
          setToAccount={setToAccount}
          sendType={isNFT ? SendAssetTypeEnum.nft : SendAssetTypeEnum.token}
          step={inputStep}
          setStep={setInputStep}
          warning={warning}
          setWarning={setWarning}
          selectedToken={tokenInfo as any}
          setChainList={setChainList}
          checkFinish={isCheckAddressFinish}
          setCheckFinish={setIsCheckAddressFinish}
          setSendAmount={setAmount}
          setSendUSDAmount={setUSDAmount}
        />
      )}
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
