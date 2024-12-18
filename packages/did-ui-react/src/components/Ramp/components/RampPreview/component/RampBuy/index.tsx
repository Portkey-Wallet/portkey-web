import { IRampCryptoItem, IRampFiatItem, RampType } from '@portkey/ramp';
// import BackHeaderForPage from '../../../BackHeaderForPage';
import BackHeaderForPage from '../../../../../BackHeaderForPage';
import { RampStep } from '../../../../index.component';
import CustomSvg from '../../../../../CustomSvg';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CommonButton from '../../../../../CommonButton';
import { useEffectOnce } from 'react-use';
import { setLoading } from '../../../../../../utils';
import { getBuyFiat, getBuyLimit } from '../../../../utils/api';
import { ErrorType, INIT_HAS_ERROR, INIT_NONE_ERROR } from '../../../../types';
import { IRampLimit, TRampPreviewInitState } from '../../../../../../types';
import { isEqual, mixRampBuyShow } from '../../../../utils';
import { useReceive } from '../../../../hooks/useReceive';
import { isPotentialNumber } from '../../../../../../utils/reg';
import { formatAmountShow } from '../../../../../../utils/converter';
import AutoWidthInput from '../AutoWidthInput';
import CommonInput from '../../../../../CommonInput';
import CommonModal from '../../../../../CommonModal';
import { useDebounce } from '../../../../../../hooks/debounce';
import { ChainId } from '@portkey/types';
import { singleMessage } from '../../../../../CustomAnt';
import { SERVICE_UNAVAILABLE_TEXT } from '../../../../../../constants/ramp';
import './index.less';

export interface IRampBuyProp {
  selectedCrypto: IRampCryptoItem;
  buyCryptoList: IRampCryptoItem[];
  setStep: (rampStep: RampStep) => void;
  isMainnet: boolean;
  isBuyShow: boolean;
  onBack: () => void;
  onShowPreview: ({ initState, chainId }: { initState: TRampPreviewInitState; chainId: ChainId }) => void;
}
export default function RampBuy({
  selectedCrypto,
  buyCryptoList,
  isMainnet,
  isBuyShow: isBuySectionShow,
  setStep,
  onShowPreview,
  onBack,
}: IRampBuyProp) {
  const { symbol, icon, network, chainId } = selectedCrypto;
  const textInputRef = useRef<HTMLInputElement>(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  // const { buyCryptoList, refresh } = useBuyCryptoList();
  const [fiatList, setFiatList] = useState<IRampFiatItem[]>([]);

  const [currency, setCurrency] = useState<{
    crypto?: IRampCryptoItem;
    fiat?: IRampFiatItem;
  }>({
    crypto: buyCryptoList?.find((item) => item.symbol === symbol && item.network === network),
    fiat: undefined,
  });
  useEffect(() => {
    setCurrency((prev) => ({
      ...prev,
      crypto: buyCryptoList?.find((item) => item.symbol === symbol && item.network === network),
    }));
  }, [buyCryptoList, network, symbol]);
  const currencyRef = useRef(currency);
  currencyRef.current = currency;
  const fiat = useMemo(() => currency.fiat, [currency]);
  const crypto = useMemo(() => currency.crypto, [currency]);
  const [amount, setAmount] = useState<string>('');
  const [amountLocalError, setAmountLocalError] = useState<ErrorType>(INIT_NONE_ERROR);

  const refreshList = useCallback(async () => {
    // Loading.show();
    setLoading(true);
    try {
      const { fiatList: buyFiatList, defaultFiat: buyDefaultFiat } = await getBuyFiat({ crypto: symbol, network });
      setFiatList(buyFiatList);
      const _fiat = buyFiatList.find(
        (item) => item.symbol === buyDefaultFiat.symbol && item.country === buyDefaultFiat.country,
      );
      setCurrency((pre) => ({
        ...pre,
        fiat: _fiat,
      }));
    } catch (error) {
      console.log('buyForm refreshList error', error);
    } finally {
      setLoading(false);
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }
  }, [network, symbol]);
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

    // const loadingKey = Loading.show();
    setLoading(true);
    try {
      const limitResult = await getBuyLimit({
        crypto: _crypto.symbol,
        network: _crypto.network,
        fiat: _fiat.symbol,
        country: _fiat.country,
      });
      if (isEqual(_fiat, currencyRef.current.fiat) && isEqual(_crypto, currencyRef.current.crypto)) {
        limitAmountRef.current = limitResult;
      }
    } catch (error) {
      console.log('Buy setLimitAmount', error);
    } finally {
      setLoading(false);
    }
    // Loading.hide(loadingKey);
  }, [currency]);

  const {
    receiveAmount,
    rate,
    refreshReceive,
    amountError: amountFetchError,
    isAllowAmount,
  } = useReceive({
    type: RampType.BUY,
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

  const receiveAmountText = useMemo(() => {
    if (receiveAmount === '') {
      return `0 ${crypto?.symbol}`;
    }
    return `≈ ${receiveAmount} ${crypto?.symbol}`;
  }, [receiveAmount, crypto]);

  const onFiatChange = useCallback(async (_fiat: IRampFiatItem) => {
    setCurrency((pre) => ({
      ...pre,
      fiat: _fiat,
    }));
  }, []);

  const onChooseChange = useCallback(async () => {
    isRefreshReceiveValid.current = false;
    setAmountLocalError(INIT_NONE_ERROR);
    await setLimitAmount();
    refreshReceiveRef.current?.();
  }, [setLimitAmount]);

  useEffect(() => {
    // only fiat||crypto change or init will trigger
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
    setAmount(text);
  }, []);

  const onNext = useCallback(async () => {
    try {
      setButtonLoading(true);
      if (!crypto || !fiat) {
        return;
      }
      if (!limitAmountRef.current || !refreshReceiveRef.current) {
        console.log('onNext click2');
        return;
      }
      const amountNum = Number(amount);
      const { minLimit, maxLimit } = limitAmountRef.current;
      if (amountNum < minLimit || amountNum > maxLimit) {
        setAmountLocalError({
          ...INIT_HAS_ERROR,
          errorMsg: `Buy limit: ${formatAmountShow(minLimit, 4)} to ${formatAmountShow(maxLimit, 4)} ${
            fiat?.symbol || ''
          }`,
        });
        return;
      }

      // Compatible with the situation where the function is turned off when the user is on the page.
      const { isBuyShow } = await mixRampBuyShow({ isMainnet, isBuySectionShow, isFetch: true });
      if (!isBuyShow) {
        singleMessage.error(SERVICE_UNAVAILABLE_TEXT);
        return onBack?.();
      }
      // const isBuySectionShow = true;
      // try {
      //   const result = await refreshRampShow();
      //   isBuySectionShow = result.isBuySectionShow;
      // } catch (error) {
      //   console.log(error);
      // }
      // if (!isBuySectionShow) {
      //   // CommonToast.fail('Sorry, the service you are using is temporarily unavailable.');
      //   // navigationService.navigate('Tab');
      //   setButtonLoading(false);
      //   return;
      // }

      let _rate = rate;
      if (isRefreshReceiveValid.current === false) {
        const rst = await refreshReceiveRef.current();
        if (!rst) {
          return;
        }
        _rate = rst.rate;
      }
      // navigationService.navigate('RampPreview', {
      //   amount,
      //   fiat,
      //   crypto,
      //   type: RampType.BUY,
      //   rate: _rate,
      // });
      onShowPreview?.({
        initState: {
          crypto: crypto.symbol,
          cryptoIcon: crypto.icon,
          network: crypto.network,
          fiat: fiat.symbol,
          country: fiat.country,
          countryName: fiat.countryName,
          fiatIcon: fiat.icon,
          amount: amount,
          side: RampType.BUY,
          // tokenInfo: selectedCrypto,
        },
        chainId,
      });
    } finally {
      setButtonLoading(false);
    }
  }, [amount, chainId, crypto, fiat, isBuySectionShow, isMainnet, onBack, onShowPreview, rate]);

  const onChangeCurrency = useCallback(() => {
    if (!fiatList.length) {
      return;
    }
    setOpenFiatModal(true);
  }, [fiatList]);
  const selectedItem = useMemo(() => currency.fiat || fiatList[0], [currency.fiat, fiatList]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const debounceSearchKeyword = useDebounce(searchKeyword, 800);
  const [openFiatModal, setOpenFiatModal] = useState<boolean>(false);

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
  return (
    <>
      <BackHeaderForPage
        title={`Buy ${selectedCrypto?.symbol}`}
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
      <div className="portkey-ui-ramp-content portkey-ui-flex-column-center ramp-buy">
        <div className="ramp-buy-pageWrap">
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
          // buttonStyle={styles.btnStyle}
          disabled={!isAllowAmount || amountError.isError}
          onClick={onNext}>
          Next
        </CommonButton>
      </div>
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
                // setStep(RampStep.PREVIEW);
                // setSelectedCrypto(item);
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
