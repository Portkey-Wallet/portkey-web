import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Radio, RadioChangeEvent, message } from 'antd';
import { useEffectOnce } from 'react-use';
import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import BuyForm from './components/BuyForm';
import SellForm from './components/SellForm';
import { ZERO } from '../../constants/misc';
import {
  MAX_UPDATE_TIME,
  initValueSave,
  initCurrency,
  initToken,
  initFiat,
  initCrypto,
  BUY_SOON_TEXT,
  SELL_SOON_TEXT,
  INSUFFICIENT_FUNDS_TEXT,
  SERVICE_UNAVAILABLE_TEXT,
  SYNCHRONIZING_CHAIN_TEXT,
} from '../../constants/ramp';
import { PartialFiatType, RampDrawerType, RampTypeEnum } from '../../types';
import { divDecimals, formatAmountShow } from '../../utils/converter';
import BackHeaderForPage from '../BackHeaderForPage';
import CustomSvg from '../CustomSvg';
import { setLoading } from '../../utils';
import { handleKeyDown } from '../../utils/keyDown';
import CustomModal from '../CustomModal';
import ConfigProvider from '../config-provider';
import { IRampProps } from '.';
import './index.less';
import { fetchBuyFiatListAsync } from './utils';

export default function RampMain({ state, goBackCallback }: IRampProps) {
  const { t } = useTranslation();
  const updateTimeRef = useRef(MAX_UPDATE_TIME);
  const updateTimerRef = useRef<NodeJS.Timer | number>();
  const valueSaveRef = useRef({ ...initValueSave });
  const [errMsg, setErrMsg] = useState<string>('');
  const [warningMsg, setWarningMsg] = useState<string>('');
  const [page, setPage] = useState<RampTypeEnum>(RampTypeEnum.BUY);
  const [rate, setRate] = useState('');
  const [amount, setAmount] = useState(initCurrency);
  const [receive, setReceive] = useState('');
  const [curToken, setCurToken] = useState(initToken);
  const [curFiat, setCurFiat] = useState<PartialFiatType>(initFiat);
  const [rateUpdateTime, setRateUpdateTime] = useState(MAX_UPDATE_TIME);
  const isBuySectionShow = useMemo(() => ConfigProvider.config.ramp?.isBuySectionShow, []);
  const isSellSectionShow = useMemo(() => ConfigProvider.config.ramp?.isSellSectionShow, []);
  const isManagerSynced = useMemo(() => ConfigProvider.config.ramp?.isManagerSynced, []);
  const currentChain = useMemo(() => ConfigProvider.config.currentChain, []);
  const walletInfo = useMemo(() => ConfigProvider.config.walletInfo, []);

  // TODO ykx
  // useFetchTxFee();
  // const { ach: achFee } = useGetTxFee(currentChain?.chainId);
  const achFee = 0.39;

  const disabled = useMemo(() => !!errMsg || !amount, [errMsg, amount]);
  const showRateText = useMemo(
    () => `1 ${curToken.crypto} ≈ ${formatAmountShow(rate, 2)} ${curFiat.currency}`,
    [curFiat, curToken, rate],
  );

  useEffectOnce(() => {
    // fetchBuyFiatListAsync()
    //   .then((res) => {
    //     console.log('🌈 🌈 🌈 🌈 🌈 🌈 buyFiatList', res);
    //   })
    //   .catch((error) => {
    //     throw Error(JSON.stringify(error));
    //   });
  });

  useEffectOnce(() => {
    if (state && state.amount !== undefined) {
      const { amount, country, fiat, crypto, network, side } = state;
      setAmount(amount);
      setCurFiat({ country, currency: fiat });
      setCurToken({ crypto, network });
      setPage(side);
      valueSaveRef.current = {
        amount,
        currency: fiat,
        country,
        crypto,
        network,
        max: null,
        min: null,
        side,
        receive: '',
        isShowErrMsg: false,
      };
      updateCrypto();
    } else {
      if (!isBuySectionShow && isSellSectionShow) {
        const side = RampTypeEnum.SELL;
        setPage(side);
        valueSaveRef.current.side = side;
        setAmount(initCrypto);
        valueSaveRef.current.amount = initCrypto;
      }
      updateCrypto();
    }
    return () => {
      clearInterval(updateTimerRef.current);
      updateTimerRef.current = undefined;
    };
  });

  const showLimitText = useCallback(
    (min: string | number, max: string | number, fiat = 'USD') =>
      `Limit Amount ${formatAmountShow(min)}-${formatAmountShow(max)} ${fiat} `,
    [],
  );

  const isValidValue = useCallback(
    ({ amount, min, max }: { amount: string; min: string | number; max: string | number }) => {
      return (
        ZERO.plus(amount).isGreaterThanOrEqualTo(ZERO.plus(min)) &&
        ZERO.plus(amount).isLessThanOrEqualTo(ZERO.plus(max))
      );
    },
    [],
  );

  const setReceiveCase = useCallback(
    ({
      fiatQuantity,
      rampFee,
      cryptoQuantity,
    }: {
      fiatQuantity?: string;
      rampFee: string;
      cryptoQuantity?: string;
    }) => {
      if (valueSaveRef.current.side === RampTypeEnum.SELL && fiatQuantity && rampFee) {
        const receive = formatAmountShow(Number(fiatQuantity) - Number(rampFee), 4);
        setReceive(receive);
        valueSaveRef.current.receive = receive;
      }
      if (valueSaveRef.current.side === RampTypeEnum.BUY) {
        const receive = formatAmountShow(cryptoQuantity || '', 4);
        setReceive(receive);
        valueSaveRef.current.receive = receive;
      }
    },
    [],
  );

  const setErrMsgCase = useCallback(() => {
    const { min, max, currency, crypto, side } = valueSaveRef.current;
    if (min !== null && max !== null) {
      clearInterval(updateTimerRef.current);
      updateTimerRef.current = undefined;
      if (side === RampTypeEnum.SELL) {
        setErrMsg(showLimitText(min, max, crypto));
      }
      if (side === RampTypeEnum.BUY) {
        setErrMsg(showLimitText(min, max, currency));
      }
      valueSaveRef.current.isShowErrMsg = true;
      setReceive('');
      valueSaveRef.current.receive = '';
    }
  }, [showLimitText]);
  const { updateReceive, stopInterval } = useMemo(() => {
    const updateReceive = async (
      params = {
        crypto: valueSaveRef.current.crypto,
        network: valueSaveRef.current.network,
        fiat: valueSaveRef.current.currency,
        country: valueSaveRef.current.country,
        amount: valueSaveRef.current.amount,
        side: valueSaveRef.current.side,
      },
    ) => {
      try {
        // TODO
        // const rst = await did.rampServices.getOrderQuote(params);
        const rst = {} as any;
        if (params.amount !== valueSaveRef.current.amount) return;

        const { cryptoPrice, cryptoQuantity, fiatQuantity, rampFee } = rst;
        setReceiveCase({ fiatQuantity, rampFee, cryptoQuantity });
        setRate(cryptoPrice);
        setErrMsg('');
        setWarningMsg('');
        valueSaveRef.current.isShowErrMsg = false;
        if (!updateTimerRef.current) {
          resetTimer();
        }
      } catch (error) {
        console.log('error', error);
      }
    };

    const handleSetTimer = () => {
      updateTimerRef.current = setInterval(() => {
        --updateTimeRef.current;

        if (updateTimeRef.current === 0) {
          updateReceive();
          updateTimeRef.current = MAX_UPDATE_TIME;
        }

        setRateUpdateTime(updateTimeRef.current);
      }, 1000);
    };
    const stopInterval = () => {
      clearInterval(updateTimerRef.current);
      updateTimerRef.current = undefined;
      setRate('');
    };

    const resetTimer = () => {
      clearInterval(updateTimerRef.current);
      updateTimerRef.current = undefined;
      updateTimeRef.current = MAX_UPDATE_TIME;
      setRateUpdateTime(MAX_UPDATE_TIME);
      handleSetTimer();
    };

    return { updateReceive, handleSetTimer, stopInterval, resetTimer };
  }, [setReceiveCase]);

  const updateCrypto = useCallback(async () => {
    const { currency, crypto, network, side } = valueSaveRef.current;
    // const data = await getCryptoInfo({ fiat: currency }, crypto, network, side);
    const data = {} as any;
    if (side === RampTypeEnum.BUY) {
      if (data && data.maxPurchaseAmount !== null && data.minPurchaseAmount !== null) {
        valueSaveRef.current.max = Number(
          ZERO.plus(data.maxPurchaseAmount).decimalPlaces(4, BigNumber.ROUND_DOWN).valueOf(),
        );
        valueSaveRef.current.min = Number(
          ZERO.plus(data.minPurchaseAmount).decimalPlaces(4, BigNumber.ROUND_UP).valueOf(),
        );
      }
    } else {
      if (data && data.maxSellAmount !== null && data.minSellAmount !== null) {
        valueSaveRef.current.max = Number(
          ZERO.plus(data.maxSellAmount).decimalPlaces(4, BigNumber.ROUND_DOWN).valueOf(),
        );
        valueSaveRef.current.min = Number(ZERO.plus(data.minSellAmount).decimalPlaces(4, BigNumber.ROUND_UP).valueOf());
      }
    }
    const { amount, min, max } = valueSaveRef.current;
    if (min && max) {
      if (!isValidValue({ amount, min, max })) {
        setErrMsgCase();
        setWarningMsg('');
        stopInterval();
      } else {
        await updateReceive();
      }
    }
  }, [isValidValue, setErrMsgCase, stopInterval, updateReceive]);

  const handleInputChange = useCallback(
    async (v: string) => {
      setAmount(v);
      valueSaveRef.current.amount = v;
      const { min, max } = valueSaveRef.current;
      if (max && min && !isValidValue({ amount: v, min, max })) {
        setErrMsgCase();
        setWarningMsg('');
        stopInterval();
        return;
      }
      const { crypto, network, country, currency, side } = valueSaveRef.current;
      await updateReceive({
        crypto,
        network,
        fiat: currency,
        country,
        amount: v,
        side,
      });
    },
    [isValidValue, setErrMsgCase, stopInterval, updateReceive],
  );

  const handlePageChange = useCallback(
    async (e: RadioChangeEvent) => {
      const side = e.target.value;
      // Compatible with the situation where the function is turned off when the user is on the page.
      if (side === RampTypeEnum.BUY && !isBuySectionShow) {
        CustomModal({
          content: t(BUY_SOON_TEXT),
        });
        return;
      }
      if (side === RampTypeEnum.SELL && !isSellSectionShow) {
        CustomModal({
          content: t(SELL_SOON_TEXT),
        });
        return;
      }

      stopInterval();
      setPage(side);
      // BUY
      valueSaveRef.current = { ...initValueSave };
      valueSaveRef.current.side = side;
      setAmount(initCurrency);
      // SELL
      if (side === RampTypeEnum.SELL) {
        setAmount(initCrypto);
        valueSaveRef.current.amount = initCrypto;
      }

      setCurFiat(initFiat);
      setWarningMsg('');
      setErrMsg('');
      valueSaveRef.current.isShowErrMsg = false;
      setReceive('');
      valueSaveRef.current.receive = '';
      setRate('');
      try {
        setLoading(true);
        await updateCrypto();
      } catch (error) {
        console.log('error', error);
      } finally {
        setLoading(false);
      }
    },
    [isBuySectionShow, isSellSectionShow, stopInterval, t, updateCrypto],
  );

  const handleSelect = useCallback(
    async (v: PartialFiatType, drawerType: RampDrawerType) => {
      if (drawerType === RampDrawerType.TOKEN) {
        // only elf for now
      } else {
        if (v.currency && v.country) {
          setCurFiat(v);
          valueSaveRef.current.currency = v.currency;
          valueSaveRef.current.country = v.country;
        } else {
          return;
        }

        try {
          setLoading(true);
          await updateCrypto();
        } catch (error) {
          console.log('error', error);
        } finally {
          setLoading(false);
        }
      }
    },
    [updateCrypto],
  );

  const setInsufficientFundsMsg = useCallback(() => {
    stopInterval();

    setErrMsg(INSUFFICIENT_FUNDS_TEXT);
    valueSaveRef.current.isShowErrMsg = true;

    setReceive('');
    valueSaveRef.current.receive = '';
  }, [stopInterval]);

  const handleNext = useCallback(async () => {
    const { side } = valueSaveRef.current;
    setLoading(true);

    // Compatible with the situation where the function is turned off when the user is on the page.
    if ((side === RampTypeEnum.BUY && !isBuySectionShow) || (side === RampTypeEnum.SELL && !isSellSectionShow)) {
      setLoading(false);
      message.error(SERVICE_UNAVAILABLE_TEXT);
      return goBackCallback?.();
    }

    if (side === RampTypeEnum.SELL) {
      if (!currentChain) return setLoading(false);

      if (!isManagerSynced) {
        setLoading(false);
        setWarningMsg(SYNCHRONIZING_CHAIN_TEXT);
        return;
      } else {
        setWarningMsg('');
      }

      setLoading(false);

      if (
        ZERO.plus(divDecimals(walletInfo?.balance, walletInfo?.decimals)).isLessThanOrEqualTo(
          ZERO.plus(achFee).plus(valueSaveRef.current.amount),
        )
      ) {
        setInsufficientFundsMsg();
        return;
      }
    }
    setLoading(false);

    // const { amount, currency, country, crypto, network } = valueSaveRef.current;
    goBackCallback?.();
    // navigate('/ramp-preview', {
    //   state: {
    //     crypto,
    //     network,
    //     fiat: currency,
    //     country,
    //     amount,
    //     side,
    //     tokenInfo: state ? state.tokenInfo : null,
    //   },
    // });
  }, [
    achFee,
    currentChain,
    isBuySectionShow,
    isManagerSynced,
    isSellSectionShow,
    goBackCallback,
    setInsufficientFundsMsg,
    walletInfo?.balance,
    walletInfo?.decimals,
  ]);

  const handleBack = useCallback(() => {
    if (state && state.tokenInfo) {
      goBackCallback?.();
      // navigate('/token-detail', {
      //   state: state.tokenInfo,
      // });
    } else {
      goBackCallback?.();
    }
  }, [goBackCallback, state]);

  const renderRate = useMemo(
    () => (
      <div className="ramp-rate portkey-ui-flex-between-center">
        <div>{showRateText}</div>
        <div className="timer portkey-ui-flex-center">
          <CustomSvg type="Timer" />
          <div className="timestamp">{rateUpdateTime}s</div>
        </div>
      </div>
    ),
    [rateUpdateTime, showRateText],
  );

  return (
    <div className={clsx(['ramp-frame portkey-ui-flex-column'])}>
      <div className="ramp-title">
        <BackHeaderForPage title={t('Buy')} leftCallBack={handleBack} />
      </div>
      <div className="ramp-content portkey-ui-flex-column-center">
        <div className="ramp-radio">
          <Radio.Group defaultValue={RampTypeEnum.BUY} buttonStyle="solid" value={page} onChange={handlePageChange}>
            <Radio.Button value={RampTypeEnum.BUY}>{t('Buy')}</Radio.Button>
            <Radio.Button value={RampTypeEnum.SELL}>{t('Sell')}</Radio.Button>
          </Radio.Group>
        </div>
        {page === RampTypeEnum.BUY && (
          <BuyForm
            currencyVal={amount}
            handleCurrencyChange={handleInputChange}
            handleCurrencyKeyDown={handleKeyDown}
            handleCurrencySelect={(v) => handleSelect(v, RampDrawerType.CURRENCY)}
            curFiat={curFiat}
            tokenVal={receive}
            handleTokenChange={handleInputChange}
            handleTokenKeyDown={handleKeyDown}
            handleTokenSelect={(v) => handleSelect(v, RampDrawerType.TOKEN)}
            curToken={curToken}
            errMsg={errMsg}
            side={RampTypeEnum.BUY}
          />
        )}
        {page === RampTypeEnum.SELL && (
          <SellForm
            tokenVal={amount}
            handleTokenChange={handleInputChange}
            handleTokenKeyDown={handleKeyDown}
            handleTokenSelect={(v) => handleSelect(v, RampDrawerType.TOKEN)}
            curToken={curToken}
            currencyVal={receive}
            handleCurrencyChange={handleInputChange}
            handleCurrencyKeyDown={handleKeyDown}
            handleCurrencySelect={(v) => handleSelect(v, RampDrawerType.CURRENCY)}
            curFiat={curFiat}
            errMsg={errMsg}
            warningMsg={warningMsg}
            side={RampTypeEnum.SELL}
          />
        )}
        {rate !== '' && renderRate}
      </div>
      <div className="ramp-footer">
        <Button type="primary" htmlType="submit" disabled={disabled} onClick={handleNext}>
          {t('Next')}
        </Button>
      </div>
    </div>
  );
}
