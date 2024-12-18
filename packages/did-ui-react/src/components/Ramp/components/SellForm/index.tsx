import FiatInput from '../FiatInput';
import CryptoInput from '../CryptoInput';
import { useTranslation } from 'react-i18next';
import { handleKeyDown } from '../../../../utils/keyDown';
import GuardianApprovalModal from '../../../GuardianApprovalModal';
import { OperationTypeEnum } from '@portkey/services';
import { useCallback, useMemo, useRef, useState } from 'react';
import { generateRateText, mixRampSellShow } from '../../utils';
import { ChainId } from '@portkey/types';
import { useEffectOnce } from 'react-use';
import { IRampCryptoDefault, IRampCryptoItem, IRampFiatItem, RampType } from '@portkey/ramp';
import { ZERO } from '../../../../constants/misc';
import { SERVICE_UNAVAILABLE_TEXT, initCrypto, initFiat } from '../../../../constants/ramp';
import { divDecimals, timesDecimals } from '../../../../utils/converter';
import { GuardianApprovedItem, TRampInitState, TRampPreviewInitState } from '../../../../types';
import { singleMessage } from '../../../CustomAnt';
import { getSellFiat } from '../../utils/api';
import ExchangeRate from '../ExchangeRate';
import { WalletError, handleErrorMessage, setLoading } from '../../../../utils';
import { fetchTxFeeAsync } from '../../../../request/token';
import ThrottleButton from '../../../ThrottleButton';
import { usePortkeyAsset } from '../../../context/PortkeyAssetProvider';
import { usePortkey } from '../../../context';
import { getBalanceByContract } from '../../../../utils/sandboxUtil/getBalance';
import walletSecurityCheck from '../../../ModalMethod/WalletSecurityCheck';
import { useUpdateReceiveAndInterval } from '../../hooks/index';
import { ITransferLimitItemWithRoute } from '../../../TransferSettingsEdit/index.components';
import { getChain } from '../../../../hooks/useChainInfo';
import transferLimitCheck from '../../../ModalMethod/TransferLimitCheck';
import { getSellData } from '../../utils/sell';
import { MAIN_CHAIN_ID } from '../../../../constants/network';
import { getOperationDetails } from '../../../utils/operation.util';

interface ISellFormProps extends TRampInitState {
  isMainnet: boolean;
  isSellSectionShow: boolean;
  isErrorTip?: boolean;
  onBack: () => void;
  onShowPreview: ({ initState, chainId }: { initState: TRampPreviewInitState; chainId: ChainId }) => void;
  onModifyLimit?: (data: ITransferLimitItemWithRoute) => void;
  onModifyGuardians?: () => void;
}

export default function SellFrom({
  isMainnet,
  crypto,
  cryptoIcon,
  network,
  fiat,
  country,
  countryName,
  fiatIcon,
  amount,
  tokenInfo,
  isSellSectionShow,
  isErrorTip,
  onBack,
  onShowPreview,
  onModifyLimit,
  onModifyGuardians,
}: ISellFormProps) {
  const { t } = useTranslation();
  const chainId = useMemo(() => tokenInfo?.chainId || MAIN_CHAIN_ID, [tokenInfo?.chainId]);
  const [{ sandboxId, networkType, chainType }] = usePortkey();
  const [{ managementAccount, caInfo, initialized, caHash, originChainId }] = usePortkeyAsset();

  // currency data
  const [defaultCrypto, setDefaultCrypto] = useState<IRampCryptoDefault>({
    symbol: crypto || initCrypto.symbol,
    amount: amount || initCrypto.amount,
    network: network || initCrypto.network,
    chainId: chainId || initCrypto.chainId,
    icon: cryptoIcon || initCrypto.icon,
  });
  const defaultFiat = useRef<IRampFiatItem>({
    country: country || initFiat.country,
    symbol: fiat || initFiat.symbol,
    countryName: countryName || initFiat.countryName,
    icon: fiatIcon || initFiat.icon,
  });
  const [cryptoList, setCryptoList] = useState<IRampCryptoItem[]>([]);
  const [defaultFiatList, setDefaultFiatList] = useState<IRampFiatItem[]>([]);

  // pay
  const [cryptoAmount, setCryptoAmount] = useState<string>(amount || defaultCrypto.amount);
  const cryptoAmountRef = useRef<string>(amount || defaultCrypto.amount);
  const [cryptoSelected, setCryptoSelected] = useState<IRampCryptoItem>(defaultCrypto as IRampCryptoItem);
  const cryptoSelectedRef = useRef<IRampCryptoItem>(defaultCrypto as IRampCryptoItem);

  // receive
  const [fiatSelected, setFiatSelected] = useState<IRampFiatItem>(defaultFiat.current);
  const fiatSelectedRef = useRef<IRampFiatItem>(defaultFiat.current);

  // 15s interval
  const {
    receive,
    exchange,
    updateTime,
    errMsg,
    warningMsg,
    updateSellReceive,
    setInsufficientFundsMsg,
    checkManagerSynced,
  } = useUpdateReceiveAndInterval(RampType.SELL, {
    cryptoSelectedRef,
    fiatSelectedRef,
    cryptoAmountRef,
  });

  const disabled = useMemo(() => !!errMsg || !cryptoAmount, [cryptoAmount, errMsg]);

  // change handler
  const onCryptoChange = (val: string) => {
    const arr = val.split('.');
    // No more than eight digits after the decimal point
    if (arr[1]?.length > 8) return;
    // The total number does not exceed 13 digits, not include decimal point
    if (arr.join('').length > 13) return;

    handleCryptoChange(val);
  };

  const handleCryptoChange = useCallback(
    async (v: string) => {
      setCryptoAmount(v);
      cryptoAmountRef.current = v;

      await updateSellReceive();
    },
    [updateSellReceive],
  );

  const handleCryptoSelect = useCallback(
    async (v: IRampCryptoItem) => {
      try {
        if (v.symbol && v.network) {
          setCryptoSelected(v);
          cryptoSelectedRef.current = v;

          // update fiat list and fiat default
          const { sellDefaultFiat, sellFiatList } = await getSellFiat({ crypto: v.symbol, network: v.network });
          const sellFiatSelectedExit = sellFiatList.filter(
            (item) =>
              item.symbol === fiatSelectedRef.current.symbol && item.country === fiatSelectedRef.current.country,
          );
          if (sellFiatSelectedExit.length > 0) {
            // latest fiatSelected - exit
            fiatSelectedRef.current = sellFiatSelectedExit[0];
          } else {
            // latest fiatSelected - not exit
            const newDefaultFiat = sellFiatList.filter(
              (item) => item.symbol === sellDefaultFiat.symbol && item.country === sellDefaultFiat.country,
            );
            setFiatSelected({ ...newDefaultFiat[0] });
            fiatSelectedRef.current = { ...newDefaultFiat[0] };
          }

          await updateSellReceive();
        }
      } catch (error) {
        console.log('handleCryptoSelect error:', error);
      }
    },
    [updateSellReceive],
  );

  const handleFiatSelect = useCallback(
    async (v: IRampFiatItem) => {
      try {
        if (v.symbol && v.country) {
          setFiatSelected(v);
          fiatSelectedRef.current = v;
          await updateSellReceive();
        }
      } catch (error) {
        console.log('handleFiatSelect error:', error);
      }
    },
    [updateSellReceive],
  );

  const showRateText = generateRateText(cryptoSelected.symbol, exchange, fiatSelected.symbol);
  const [approvalVisible, setApprovalVisible] = useState<boolean>(false);

  const handleShowPreview = useCallback(
    (approveList?: GuardianApprovedItem[]) => {
      onShowPreview({
        initState: {
          crypto: cryptoSelectedRef.current.symbol,
          cryptoIcon: cryptoSelectedRef.current.icon,
          network: cryptoSelectedRef.current.network,
          fiat: fiatSelectedRef.current.symbol,
          country: fiatSelectedRef.current.country,
          countryName: fiatSelectedRef.current.countryName,
          fiatIcon: fiatSelectedRef.current.icon,
          amount: cryptoAmountRef.current,
          side: RampType.SELL,
          tokenInfo: tokenInfo,
          approveList,
        },
        chainId,
      });
    },
    [chainId, onShowPreview, tokenInfo],
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
      try {
        if (!caInfo) return singleMessage.error('Please confirm whether to log in');
        const chainInfo = await getChain(chainId);
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
          ownerCaAddress: caInfo[chainId]?.caAddress || '',
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
    [caHash, caInfo, chainId, chainType, managementAccount?.privateKey, onModifyLimit, tokenInfo?.tokenContractAddress],
  );

  const handleNext = useCallback(async () => {
    try {
      if (!caInfo) return singleMessage.error('Please confirm whether to log in');
      setLoading(true);

      // CHECK 1: is show buy\sell
      // Compatible with the situation where the function is turned off when the user is on the page.
      const { isSellShow } = await mixRampSellShow({ isMainnet, isSellSectionShow, isFetch: true });
      if (!isSellShow) {
        setLoading(false);
        singleMessage.error(SERVICE_UNAVAILABLE_TEXT);
        return onBack?.();
      }

      // CHECK 2: manager sync
      const _isManagerSynced = await checkManagerSynced(chainId);
      if (!_isManagerSynced) return setLoading(false);

      // CHECK 3: account security
      const securityRes = await walletSecurityCheck({
        originChainId: originChainId,
        targetChainId: chainId,
        caHash: caHash || '',
        onOk: onModifyGuardians,
      });
      if (!securityRes) return setLoading(false);

      // CHECK 4: balance and tx fee, search balance from contract
      const result = await getBalanceByContract({
        sandboxId,
        chainType,
        chainId: chainId,
        tokenContractAddress: tokenInfo?.tokenContractAddress || '',
        paramsOption: {
          owner: caInfo[chainId]?.caAddress || '',
          symbol: cryptoSelectedRef.current.symbol,
        },
      });

      setLoading(false);
      const balance = result.balance;
      const achFee = await fetchTxFeeAsync([chainId]);
      if (
        ZERO.plus(divDecimals(balance, cryptoSelectedRef.current.decimals)).isLessThanOrEqualTo(
          ZERO.plus(achFee[chainId].ach).plus(cryptoAmountRef.current),
        )
      ) {
        setInsufficientFundsMsg();
        return;
      }

      // CHECK 5: transfer limit
      const limitRes = await handleCheckTransferLimit(balance);
      if (!limitRes) return setLoading(false);

      handleShowPreview();
    } catch (error) {
      console.log('handleCryptoSelect error:', error);
    } finally {
      setLoading(false);
    }
  }, [
    caHash,
    caInfo,
    chainId,
    chainType,
    checkManagerSynced,
    handleCheckTransferLimit,
    handleShowPreview,
    isMainnet,
    isSellSectionShow,
    onBack,
    onModifyGuardians,
    originChainId,
    sandboxId,
    setInsufficientFundsMsg,
    tokenInfo?.tokenContractAddress,
  ]);

  const fetchSellData = useCallback(async () => {
    const { sellCryptoList, sellDefaultCrypto, sellDefaultFiatList, sellDefaultFiat } = await getSellData();

    const filterCryptoSelected = sellCryptoList.filter(
      (item) =>
        item.symbol === (crypto || sellDefaultCrypto.symbol) && item.network === (network || sellDefaultCrypto.network),
    );
    setDefaultCrypto(sellDefaultCrypto);
    setCryptoList(sellCryptoList);
    setCryptoSelected({ ...filterCryptoSelected[0] });
    cryptoSelectedRef.current = { ...filterCryptoSelected[0] };

    const filterFiatSelected = sellDefaultFiatList.filter(
      (item) =>
        item.symbol === (fiat || sellDefaultFiat.symbol) && item.country === (country || sellDefaultFiat.country),
    );
    setDefaultFiatList(sellDefaultFiatList);
    setFiatSelected({ ...filterFiatSelected[0] });
    fiatSelectedRef.current = { ...filterFiatSelected[0] };

    // compute receive
    updateSellReceive();
  }, [country, crypto, fiat, network, updateSellReceive]);

  useEffectOnce(() => {
    // check security
    walletSecurityCheck({
      originChainId: originChainId,
      targetChainId: chainId,
      caHash: caHash || '',
      onOk: onModifyGuardians,
    }).catch((error) => {
      const msg = handleErrorMessage(error);
      console.log('check security error: ', msg);
    });

    if (initialized) {
      fetchSellData();
    }
  });

  return (
    <>
      <div className="portkey-ui-ramp-sell-form portkey-ui-flex-column-center">
        <div className="portkey-ui-ramp-input">
          <div className="label">{`I want to sell`}</div>
          <CryptoInput
            networkType={networkType}
            value={cryptoAmount}
            readOnly={false}
            curCrypto={cryptoSelected}
            supportList={cryptoList}
            onChange={onCryptoChange}
            onSelect={handleCryptoSelect}
            onKeyDown={handleKeyDown}
          />
          {!!errMsg && <div className="error-text">{t(errMsg)}</div>}
          {!!warningMsg && <div className="warning-text">{t(warningMsg)}</div>}
        </div>
        <div className="portkey-ui-ramp-input">
          <div className="label">{`I will receive≈`}</div>
          <FiatInput
            // value={receive}
            // readOnly={true}
            // curFiat={fiatSelected}
            defaultCrypto={defaultCrypto}
            supportList={defaultFiatList}
            onSelect={handleFiatSelect}
            // onKeyDown={handleKeyDown}
          />
        </div>
        {exchange !== '' && !errMsg && <ExchangeRate showRateText={showRateText} rateUpdateTime={updateTime} />}
      </div>
      <div className="portkey-ui-ramp-footer">
        <ThrottleButton type="primary" htmlType="submit" disabled={disabled} onClick={handleNext}>
          {t('Next')}
        </ThrottleButton>
      </div>

      <GuardianApprovalModal
        open={approvalVisible}
        networkType={networkType}
        caHash={caHash || ''}
        originChainId={originChainId}
        targetChainId={chainId}
        operationType={OperationTypeEnum.transferApprove}
        operationDetails={getOperationDetails(OperationTypeEnum.transferApprove, {
          symbol: cryptoSelectedRef.current.symbol,
          amount: timesDecimals(cryptoAmountRef.current, cryptoSelectedRef.current.decimals).toNumber(),
          toAddress: cryptoSelectedRef.current.address,
        })}
        officialWebsiteShow={{ amount: cryptoAmount, symbol: cryptoSelectedRef.current.symbol }}
        isErrorTip={isErrorTip}
        sandboxId={sandboxId}
        onClose={() => setApprovalVisible(false)}
        onBack={() => setApprovalVisible(false)}
        onApprovalSuccess={onApprovalSuccess}
      />
    </>
  );
}
