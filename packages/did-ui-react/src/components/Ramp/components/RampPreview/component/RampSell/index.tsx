import { IRampCryptoItem, IRampFiatItem, RampType } from '@portkey/ramp';
import BackHeaderForPage from '../../../../../BackHeaderForPage';
import { RampStep } from '../../../../index.component';
import CustomSvg from '../../../../../CustomSvg';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFeeByChainId, useTxFeeInit } from '../../../../../context/PortkeyAssetProvider/hooks/txFee';
import { ErrorType, INIT_HAS_ERROR, INIT_NONE_ERROR } from '../../../../types';
import { divDecimals, formatTokenAmountShowWithDecimals, timesDecimals } from '../../../../../../utils/converter';
import { useReceive } from '../../../../hooks/useReceive';
import { isEqual, mixRampSellShow } from '../../../../utils';
import { useEffectOnce } from 'react-use';
import { GuardianApprovedItem, IRampLimit, TRampPreviewInitState } from '../../../../../../types';
import { handleErrorMessage, setLoading, WalletError } from '../../../../../../utils';
import { getSellFiat, getSellLimit } from '../../../../utils/api';
import { isPotentialNumber } from '../../../../../../utils/reg';
import { ChainId } from '@portkey/types';
import GuardianApprovalModal from '../../../../../GuardianApprovalModal';
import { usePortkey } from '../../../../../context';
import {
  CommonButton,
  CommonModal,
  getOperationDetails,
  singleMessage,
  transferLimitCheck,
  usePortkeyAsset,
  walletSecurityCheck,
} from '../../../../..';
import { OperationTypeEnum } from '@portkey/services';
import { SERVICE_UNAVAILABLE_TEXT } from '../../../../../../constants/ramp';
import { useUpdateReceiveAndInterval } from '../../../../hooks';
import { getBalanceByContract } from '../../../../../../utils/sandboxUtil/getBalance';
import { fetchTxFeeAsync } from '../../../../../../request/token';
import { getChain } from '../../../../../../hooks';
import CommonInput from '../../../../../CommonInput';
import { useDebounce } from '../../../../../../hooks/debounce';
import { ZERO } from '../../../../../../constants/misc';
import { ITransferLimitItemWithRoute } from '../../../../../../types/transfer';
import MaxTokenShortcut from '../../../../../MaxTokenShortcut';
import AutoWidthInput from '../../../../../AutoWidthInput';
import './index.less';

export interface IRampPreviewProp {
  selectedCrypto: IRampCryptoItem;
  sellCryptoList: IRampCryptoItem[];
  setStep: (rampStep: RampStep) => void;
  isMainnet: boolean;
  isSellShow: boolean;
  onBack: () => void;
  onModifyGuardians?: () => void;
  onShowPreview?: ({ initState, chainId }: { initState: TRampPreviewInitState; chainId: ChainId }) => void;
  onModifyLimit?: (data: ITransferLimitItemWithRoute) => void;
}
export default function RampSell({
  selectedCrypto,
  sellCryptoList,
  isMainnet,
  isSellShow: routerIsSellShow,
  setStep,
  onShowPreview,
  onBack,
  onModifyGuardians,
  onModifyLimit,
}: IRampPreviewProp) {
  const {
    symbol: routerSymbol,
    decimals: routerDecimals,
    network: routerNetwork,
    chainId: routerChainId,
    icon: routerIcon,
    address: routerAddress,
  } = selectedCrypto;

  const textInputRef = useRef<HTMLInputElement>(null);
  const [fiatList, setFiatList] = useState<IRampFiatItem[]>([]);
  const [buttonLoading, setButtonLoading] = useState(false);

  const [currency, setCurrency] = useState<{
    crypto?: IRampCryptoItem;
    fiat?: IRampFiatItem;
  }>({
    crypto: sellCryptoList.find((item) => item.symbol === routerSymbol && item.network === routerNetwork),
    fiat: undefined,
  });
  const currencyRef = useRef(currency);
  currencyRef.current = currency;
  const crypto = useMemo(() => currency.crypto, [currency]);
  const fiat = useMemo(() => currency.fiat, [currency]);
  useTxFeeInit();
  const { ach: achFee } = useFeeByChainId(routerChainId);
  const [amount, setAmount] = useState<string>('');
  const [amountLocalError, setAmountLocalError] = useState<ErrorType>(INIT_NONE_ERROR);

  const [openFiatModal, setOpenFiatModal] = useState<boolean>(false);
  const selectedItem = useMemo(() => currency.fiat || fiatList[0], [currency.fiat, fiatList]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const debounceSearchKeyword = useDebounce(searchKeyword, 800);

  const onChangeCurrency = useCallback(() => {
    if (!fiatList.length) {
      return;
    }
    setOpenFiatModal(true);
  }, [fiatList]);
  const onSearchInputChange = useCallback(
    (text: string) => {
      setSearchKeyword(text.trim());
    },
    [setSearchKeyword],
  );
  const filteredList = useMemo(() => {
    if (debounceSearchKeyword.length <= 0) return fiatList;
    return fiatList.filter((item) =>
      `${item.countryName} (${item.symbol})`.toLowerCase().includes(debounceSearchKeyword.toLowerCase()),
    );
  }, [fiatList, debounceSearchKeyword]);

  // sell form start
  const [{ sandboxId, networkType, chainType }] = usePortkey();
  const [{ managementAccount, caInfo, caHash, originChainId, tokenListInfo }] = usePortkeyAsset();
  const a = usePortkeyAsset();
  console.log('usePortkeyAsset====', a);
  const [approvalVisible, setApprovalVisible] = useState<boolean>(false);
  const cryptoSelectedRef = useRef(currency.crypto);
  cryptoSelectedRef.current = currency.crypto;
  const fiatSelectedRef = useRef(currency.fiat);
  fiatSelectedRef.current = currency.fiat;
  const cryptoAmountRef = useRef(amount);
  cryptoAmountRef.current = amount;
  const { checkManagerSynced } = useUpdateReceiveAndInterval(RampType.SELL, {
    cryptoSelectedRef,
    fiatSelectedRef,
    cryptoAmountRef,
  });
  const tokenInfo = useMemo(() => {
    const tokenSection = tokenListInfo?.list?.find(
      (item) => item.symbol === routerSymbol && item.chainId === routerChainId,
    );
    return tokenSection;
  }, [tokenListInfo, routerSymbol, routerChainId]);

  const handleShowPreview = useCallback(
    (approveList?: GuardianApprovedItem[]) => {
      if (!currency.fiat) {
        return;
      }
      onShowPreview?.({
        initState: {
          crypto: routerSymbol,
          cryptoIcon: routerIcon,
          network: routerNetwork,
          fiat: currency.fiat.symbol,
          country: currency.fiat.country,
          countryName: currency.fiat.countryName,
          fiatIcon: currency.fiat.icon,
          amount: amount,
          side: RampType.SELL,
          tokenInfo: tokenInfo,
          approveList,
        },
        chainId: routerChainId,
      });
    },
    [amount, routerChainId, currency.fiat, onShowPreview, routerIcon, routerNetwork, routerSymbol, tokenInfo],
  );

  const onApprovalSuccess = useCallback(
    (approveList: any[]) => {
      try {
        if (Array.isArray(approveList) && approveList.length > 0) {
          setApprovalVisible(false);
          handleShowPreview(approveList);
        } else {
          console.log('getApprove error: approveList empty');
        }
      } catch (error) {
        console.log('getApprove error: set list error');
      }
    },
    [handleShowPreview],
  );
  const handleCheckTransferLimit = useCallback(
    async (balance: string) => {
      if (!cryptoSelectedRef.current || !fiatSelectedRef.current) {
        return;
      }
      try {
        if (!caInfo) return singleMessage.error('Please confirm whether to log in');
        const chainInfo = await getChain(routerChainId);
        const privateKey = managementAccount?.privateKey;
        if (!privateKey) throw WalletError.invalidPrivateKey;
        if (!caHash) throw 'Please login';

        const res = await transferLimitCheck({
          rpcUrl: chainInfo?.endPoint || '',
          caContractAddress: chainInfo?.caContractAddress || '',
          caHash: caHash,
          chainId: cryptoSelectedRef.current.chainId,
          symbol: cryptoSelectedRef.current.symbol,
          amount: cryptoAmountRef.current,
          decimals: cryptoSelectedRef.current.decimals,
          businessFrom: {
            module: 'ramp-sell',
            extraConfig: {
              crypto: cryptoSelectedRef.current.symbol,
              cryptoIcon: cryptoSelectedRef.current.icon,
              network: cryptoSelectedRef.current.network,
              fiat: fiatSelectedRef.current.symbol,
              country: fiatSelectedRef.current.country,
              countryName: fiatSelectedRef.current.countryName,
              fiatIcon: fiatSelectedRef.current.icon,
              amount: cryptoAmountRef.current,
              side: RampType.SELL,
            },
          },
          balance,
          chainType,
          tokenContractAddress: tokenInfo?.tokenContractAddress || '',
          ownerCaAddress: caInfo[routerChainId]?.caAddress || '',
          onOneTimeApproval: async () => {
            setApprovalVisible(true);
          },
          onModifyTransferLimit: onModifyLimit,
        });

        return res;
      } catch (error) {
        setLoading(false);

        const msg = handleErrorMessage(error);
        singleMessage.error(msg);
      }
    },
    [
      caHash,
      caInfo,
      routerChainId,
      chainType,
      managementAccount?.privateKey,
      onModifyLimit,
      tokenInfo?.tokenContractAddress,
    ],
  );
  const handleNext = useCallback(async () => {
    try {
      if (!caInfo) return singleMessage.error('Please confirm whether to log in');
      setButtonLoading(true);
      // CHECK 1: is show buy\sell
      // Compatible with the situation where the function is turned off when the user is on the page.
      const { isSellShow } = await mixRampSellShow({ isMainnet, isSellSectionShow: routerIsSellShow, isFetch: true });
      if (!isSellShow) {
        // setLoading(false);
        singleMessage.error(SERVICE_UNAVAILABLE_TEXT);
        return onBack?.();
      }

      // CHECK 2: manager sync
      const _isManagerSynced = await checkManagerSynced(routerChainId);
      // if (!_isManagerSynced) return setLoading(false);
      if (!_isManagerSynced) return;

      // CHECK 3: account security
      const securityRes = await walletSecurityCheck({
        originChainId: originChainId,
        targetChainId: routerChainId,
        caHash: caHash || '',
        onOk: onModifyGuardians,
      });
      // if (!securityRes) return setLoading(false);
      if (!securityRes) return;

      // CHECK 4: balance and tx fee, search balance from contract
      console.log('cryptoSelectedRef current', cryptoSelectedRef.current);
      const result = await getBalanceByContract({
        sandboxId,
        chainType,
        chainId: routerChainId,
        tokenContractAddress: tokenInfo?.tokenContractAddress || '',
        paramsOption: {
          owner: caInfo[routerChainId]?.caAddress || '',
          symbol: cryptoSelectedRef.current?.symbol || '',
        },
      });

      // setLoading(false);
      const balance = result.balance;
      const achFee = await fetchTxFeeAsync([routerChainId]);
      if (
        ZERO.plus(divDecimals(balance, cryptoSelectedRef.current?.decimals)).isLessThanOrEqualTo(
          ZERO.plus(achFee[routerChainId].ach).plus(cryptoAmountRef.current),
        )
      ) {
        // setInsufficientFundsMsg();
        throw new Error('Insufficient funds');
        // return;
      }

      // CHECK 5: transfer limit
      const limitRes = await handleCheckTransferLimit(balance);
      // if (!limitRes) return setLoading(false);
      if (!limitRes) return;

      handleShowPreview();
    } catch (error) {
      console.error('handleCryptoSelect error wfs:', error);
      setAmountLocalError({ ...INIT_HAS_ERROR, errorMsg: 'Insufficient funds' });
      console.error('error wfs', error);
    } finally {
      setButtonLoading(false);
    }
  }, [
    caInfo,
    isMainnet,
    routerIsSellShow,
    checkManagerSynced,
    routerChainId,
    originChainId,
    caHash,
    onModifyGuardians,
    sandboxId,
    chainType,
    tokenInfo?.tokenContractAddress,
    handleCheckTransferLimit,
    handleShowPreview,
    onBack,
  ]);
  // sell form end

  const refreshList = useCallback(async () => {
    setLoading(true);
    try {
      const { sellFiatList, sellDefaultFiat } = await getSellFiat({
        crypto: routerSymbol || '',
        network: routerNetwork || '',
      });

      setFiatList(sellFiatList);
      const _fiat = sellFiatList.find(
        (item) => item.symbol === sellDefaultFiat.symbol && item.country === sellDefaultFiat.country,
      );

      setCurrency((pre) => ({
        ...pre,
        fiat: _fiat,
      }));
    } catch (error) {
      console.log('sellForm refreshList error', error);
    } finally {
      setLoading(false);
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }
  }, [routerNetwork, routerSymbol]);
  useEffectOnce(() => {
    refreshList();
  });

  const limitAmountRef = useRef<IRampLimit>();
  const isRefreshReceiveValid = useRef<boolean>(false);

  const setLimitAmount = useCallback(async () => {
    limitAmountRef.current = undefined;
    const { fiat: _fiat, crypto: _crypto } = currency;
    if (_fiat === undefined || _crypto === undefined) {
      return;
    }

    setLoading(true);
    try {
      const limitResult = await getSellLimit({
        crypto: _crypto.symbol,
        network: _crypto.network,
        fiat: _fiat.symbol,
        country: _fiat.country,
      });
      if (isEqual(_fiat, currencyRef.current.fiat) && isEqual(_crypto, currencyRef.current.crypto)) {
        limitAmountRef.current = limitResult;
      }
    } catch (error) {
      console.log('Sell setLimitAmount', error);
    }
    setLoading(false);
  }, [currency]);

  const {
    receiveAmount,
    refreshReceive,
    amountError: amountFetchError,
    isAllowAmount,
  } = useReceive({
    type: RampType.SELL,
    amount,
    fiat,
    crypto,
    initialReceiveAmount: '',
    initialRate: '',
    limitAmountRef,
    isRefreshReceiveValid,
  });
  const refreshReceiveRef = useRef<typeof refreshReceive>();
  refreshReceiveRef.current = refreshReceive;

  const amountError = useMemo(() => {
    if (amountFetchError.isError && amountFetchError.errorMsg !== '') {
      return amountFetchError;
    }
    return amountLocalError;
  }, [amountFetchError, amountLocalError]);

  const onFiatChange = useCallback((_fiat: IRampFiatItem) => {
    setCurrency((pre) => ({ ...pre, fiat: _fiat }));
  }, []);

  const onChooseChange = useCallback(async () => {
    isRefreshReceiveValid.current = false;
    setAmountLocalError(INIT_NONE_ERROR);
    await setLimitAmount();
    refreshReceiveRef.current?.();
  }, [setLimitAmount]);

  useEffect(() => {
    // only fiat||token change or init will trigger
    onChooseChange();
  }, [onChooseChange]);

  const onAmountInput = useCallback((text: string) => {
    isRefreshReceiveValid.current = false;
    setAmountLocalError(INIT_NONE_ERROR);

    if (text === '') {
      setAmount('');
      return;
    }
    if (!isPotentialNumber(text)) {
      return;
    }
    const arr = text.split('.');
    if (arr[1]?.length > 8) {
      return;
    }
    if (arr.join('').length > 13) {
      return;
    }
    setAmount(text);
  }, []);

  const maxAmount = useMemo(() => {
    return formatTokenAmountShowWithDecimals(tokenInfo?.balance, tokenInfo?.decimals);
  }, [tokenInfo]);

  const onMaxPress = useCallback(() => {
    const maxAmountNumber = Number(maxAmount);
    if (Number.isNaN(maxAmountNumber)) {
      return;
    }
    if (ZERO.plus(amount).isLessThanOrEqualTo(achFee)) {
      singleMessage.error('Insufficient funds');
      return;
    }
    onAmountInput(`${maxAmountNumber - achFee}`);
  }, [maxAmount, amount, achFee, onAmountInput]);

  const receiveAmountText = useMemo(() => {
    if (receiveAmount === '') {
      return `0 ${currency?.fiat?.symbol}`;
    }
    return `≈ ${receiveAmount} ${currency?.fiat?.symbol}`;
  }, [receiveAmount, currency]);

  return (
    <>
      <BackHeaderForPage
        title={`Sell ${selectedCrypto?.symbol}`}
        leftCallBack={() => {
          setStep(RampStep.HOME);
        }}
        rightElement={
          <div className="portkey-ui-flex-row-center right-element">
            <CustomSvg type={'Change'} className="change-svg" />
            <span className="right-fiat-title">{currency.fiat?.symbol}</span>
          </div>
        }
        rightCallback={onChangeCurrency}
      />
      <div className="portkey-ui-ramp-content portkey-ui-flex-column-center ramp-sell">
        <div className="ramp-sell-pageWrap">
          <MaxTokenShortcut tokenInfo={currency.crypto} maxAmount={maxAmount} onMaxPress={onMaxPress} />
          {/* Fiat Input Section */}
          <div className="fiatWrap">
            {/* Amount Input */}
            <AutoWidthInput
              placeholder="0"
              onAmountInput={onAmountInput}
              amount={amount}
              amountError={amountError}
              textInputRef={textInputRef}
            />
            {/* Fiat Symbol */}
            <div
              className="fiatText"
              onClick={() => {
                if (textInputRef.current) {
                  textInputRef.current.focus();
                }
              }}>
              {currency.fiat?.symbol}
            </div>
          </div>

          {/* Receive Amount */}
          <p className="receiveAmount">{receiveAmountText}</p>
          {amountError.isError && <p className="warningText">{amountError.errorMsg}</p>}
        </div>
        <CommonButton
          loading={buttonLoading}
          type="primary"
          block
          disabled={!isAllowAmount || amountError.isError}
          onClick={handleNext}>
          Next
        </CommonButton>
      </div>
      <GuardianApprovalModal
        open={approvalVisible}
        networkType={networkType}
        caHash={caHash || ''}
        originChainId={originChainId}
        targetChainId={routerChainId}
        operationType={OperationTypeEnum.transferApprove}
        operationDetails={getOperationDetails(OperationTypeEnum.transferApprove, {
          symbol: routerSymbol,
          amount: timesDecimals(amount, routerDecimals).toNumber(),
          toAddress: routerAddress,
        })}
        officialWebsiteShow={{ amount: amount, symbol: routerSymbol }}
        isErrorTip={true}
        sandboxId={sandboxId}
        onClose={() => setApprovalVisible(false)}
        onBack={() => setApprovalVisible(false)}
        onApprovalSuccess={onApprovalSuccess}
      />
      <CommonModal
        className="change-currency-modal-list"
        open={openFiatModal}
        onClose={() => {
          setOpenFiatModal(false);
        }}>
        <div className="change-currency-modal-list-title">Change currency</div>
        <CommonInput
          type="search"
          className="change-currency-modal-list-search"
          placeholder="Search"
          onChange={(e) => {
            onSearchInputChange(e.target.value);
          }}
        />
        <ul style={{ width: '100%', marginTop: 16, overflowY: 'auto' }}>
          {filteredList?.map((item, index) => (
            <li
              key={index + '_' + item.symbol}
              className="fiat-list-item"
              onClick={() => {
                onFiatChange(item);
                setOpenFiatModal(false);
              }}>
              {/* <TokenImageDisplay src={item.icon} symbol={item.symbol} /> */}
              <span className="fiat-name">{`${item.countryName} (${item.symbol})`}</span>
              {selectedItem.countryName === item.countryName && selectedItem.symbol === item.symbol && (
                <CustomSvg type="CheckCircle" className="fiat-check-circle" />
              )}
            </li>
          ))}
        </ul>
      </CommonModal>
    </>
  );
}
