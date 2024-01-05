import { IAssetItemType, OperationTypeEnum } from '@portkey/services';
import { wallet } from '@portkey/utils';
import CustomSvg from '../CustomSvg';
import TitleWrapper from '../TitleWrapper';
import { Button } from 'antd';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { ReactElement, useCallback, useMemo, useRef, useState } from 'react';
import { getAddressChainId, getAelfAddress, isCrossChain, isDIDAddress } from '../../utils/aelf';
import { AddressCheckError } from '../../types';
import { ChainId } from '@portkey/types';
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
import { GuardianApprovedItem } from '../Guardian/utils/type';

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

type ToAccount = { name?: string; address: string };

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
  const [stage, setStage] = useState<Stage>(extraConfig?.stage || Stage.Address);
  const [approvalVisible, setApprovalVisible] = useState<boolean>(false);
  const isNFT = useMemo(() => Boolean(assetItem.nftInfo), [assetItem]);
  const [txFee, setTxFee] = useState<string>();

  const tokenInfo: AssetTokenExpand = useMemo(
    () => ({
      chainId: assetItem.chainId as ChainId,
      decimals: isNFT ? 0 : assetItem.tokenInfo?.decimals ?? DEFAULT_DECIMAL,
      address: (isNFT ? assetItem?.nftInfo?.tokenContractAddress : assetItem?.tokenInfo?.tokenContractAddress) || '',
      symbol: assetItem.symbol,
      name: assetItem.symbol,
      imageUrl: isNFT ? assetItem.nftInfo?.imageUrl : '',
      alias: isNFT ? assetItem.nftInfo?.alias : '',
      tokenId: isNFT ? assetItem.nftInfo?.tokenId : '',
      balance: isNFT ? assetItem.nftInfo?.balance : assetItem.tokenInfo?.balance,
      balanceInUsd: isNFT ? '' : assetItem.tokenInfo?.balanceInUsd,
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

  const retryCrossChain = useCallback(
    async ({ transactionId, params }: the2ThFailedActivityItemType) => {
      try {
        //
        const privateKey = managementAccount?.privateKey;
        if (!privateKey) return;
        setLoading(true);
        await intervalCrossChainTransfer({ ...params, privateKey });
        // TODO
        // dispatch(removeFailedActivity(transactionId));
      } catch (error) {
        console.log('retry addFailedActivity', error);
        showErrorModal({ transactionId, params });
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [managementAccount?.privateKey],
  );

  const showErrorModal = useCallback(
    (error: the2ThFailedActivityItemType) => {
      Modal.error({
        width: 320,
        className: 'portkey-ui-transaction-retry-modal',
        okText: 'Resend',
        icon: null,
        closable: false,
        centered: true,
        title: (
          <div className="portkey-ui-flex-column-center transaction-msg">
            <CustomSvg type="WarnRed" />
            Transaction failed !
          </div>
        ),
        onOk: () => {
          console.log('retry modal addFailedActivity', error);
          retryCrossChain(error);
        },
      });
    },
    [retryCrossChain],
  );

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
      onOneTimeApproval: () => {
        setApprovalVisible(true);
      },
      onModifyTransferLimit: onModifyLimit,
    });

    return res;
  }, [
    amount,
    balance,
    caHash,
    caInfo,
    chainType,
    managementAccount?.privateKey,
    onModifyLimit,
    stage,
    toAccount,
    tokenInfo?.address,
    tokenInfo.chainId,
    tokenInfo.decimals,
    tokenInfo.symbol,
  ]);

  const sendTransfer = useCallback(async () => {
    try {
      if (!managementAccount?.privateKey || !caHash) return;

      setLoading(true);

      if (isCrossChain(toAccount.address, tokenInfo.chainId)) {
        await crossChainTransfer({
          sandboxId,
          chainType,
          privateKey: managementAccount?.privateKey,
          managerAddress: managementAccount?.address,
          tokenInfo,
          caHash: caHash || '',
          amount: timesDecimals(amount, tokenInfo.decimals).toNumber(),
          toAddress: toAccount.address,
          crossChainFee: defaultFee.crossChain,
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
        // dispatch(addFailedActivity(error.data));
        // TODO
        console.log('addFailedActivity', error);

        showErrorModal(error.data);
        singleMessage.error(handleErrorMessage(error));

        // return;
      } else {
        singleMessage.error(handleErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  }, [
    amount,
    caHash,
    chainType,
    defaultFee.crossChain,
    managementAccount?.address,
    managementAccount?.privateKey,
    onSuccess,
    sandboxId,
    showErrorModal,
    toAccount.address,
    tokenInfo,
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

  const btnOutOfFocus = useCallback(() => {
    // fixed - button focus style when mobile
    if (typeof document !== 'undefined') document.body.focus();
  }, []);

  const checkManagerSyncState = useCheckManagerSyncState();

  const oneTimeApprovalList = useRef<GuardianApprovedItem[]>([]);
  const onApprovalSuccess = useCallback(
    async (approveList: GuardianApprovedItem[]) => {
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
    },
    [sendTransfer, stage],
  );

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
          <AmountInput
            type={isNFT ? 'nft' : 'token'}
            fromAccount={{
              address: caInfo?.[tokenInfo.chainId].caAddress || '',
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
            symbol={tokenInfo?.symbol || ''}
            alias={tokenInfo.alias || ''}
            imageUrl={tokenInfo.imageUrl || ''}
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
        className="page-title"
        title={`Send ${!isNFT ? tokenInfo.symbol : ''}`}
        leftCallBack={() => {
          StageObj[stage].backFun();
        }}
      />
      {stage !== Stage.Preview && (
        <div className="address-wrap">
          <div className="item from">
            <span className="label">From:</span>
            <div className={'from-wallet control'}>
              <div className="name">{accountInfo?.nickName || '--'}</div>
            </div>
          </div>
          <div className="item to">
            <span className="label">To:</span>
            <div className="control">
              <ToAccount value={toAccount} onChange={(v) => setToAccount(v)} focus={stage !== Stage.Amount} />
              {stage === Stage.Amount && (
                <CustomSvg
                  type="Close2"
                  onClick={() => {
                    setStage(Stage.Address);
                    setToAccount({ address: '' });
                  }}
                />
              )}
            </div>
          </div>
          {errorMsg && <span className="error-msg">{errorMsg}</span>}
        </div>
      )}
      <div className="stage-ele">{StageObj[stage].element}</div>
      <div className="btn-wrap">
        <Button disabled={btnDisabled} className="stage-btn" type="primary" onClick={StageObj[stage].handler}>
          {StageObj[stage].btnText}
        </Button>
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
