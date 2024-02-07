import FiatInput from '../FiatInput';
import CryptoInput from '../CryptoInput';
import { useTranslation } from 'react-i18next';
import { useEffectOnce } from 'react-use';
import { useCallback, useMemo, useRef, useState } from 'react';
import { singleMessage } from '../../../CustomAnt';
import { SERVICE_UNAVAILABLE_TEXT, initCrypto, initFiat } from '../../../../constants/ramp';
import { IRampCryptoDefault, IRampCryptoItem, IRampFiatDefault, IRampFiatItem, RampType } from '@portkey/ramp';
import { Button } from 'antd';
import { handleKeyDown } from '../../../../utils/keyDown';
import { generateRateText, mixRampBuyShow } from '../../utils';
import { useUpdateReceiveAndInterval } from '../../hooks/index';
import { setLoading } from '../../../../utils';
import ExchangeRate from '../ExchangeRate';
import { TRampInitState, TRampPreviewInitState } from '../../../../types';
import { ChainId } from '@portkey/types';
import { getBuyData, getSpecifiedBuyFiat } from '../../utils/buy';
import { getBuyCrypto } from '../../utils/api';
import { usePortkey } from '../../../context';
import { usePortkeyAsset } from '../../../context/PortkeyAssetProvider';
import { MAIN_CHAIN_ID } from '../../../../constants/network';

interface IBuyFormProps extends TRampInitState {
  isMainnet: boolean;
  isBuySectionShow: boolean;
  onBack: () => void;
  onShowPreview: ({ initState, chainId }: { initState: TRampPreviewInitState; chainId: ChainId }) => void;
}

export default function BuyFrom({
  isMainnet,
  isBuySectionShow,
  crypto,
  network,
  fiat,
  country,
  amount,
  tokenInfo,
  onBack,
  onShowPreview,
}: IBuyFormProps) {
  const { t } = useTranslation();
  const chainId = useMemo(() => tokenInfo?.chainId || MAIN_CHAIN_ID, [tokenInfo?.chainId]);
  const [{ networkType }] = usePortkey();
  const [{ initialized }] = usePortkeyAsset();

  // init data
  const [defaultFiat, setDefaultFiat] = useState<IRampFiatDefault>(initFiat);
  const [defaultCrypto, setDefaultCrypto] = useState<IRampCryptoDefault>(initCrypto);
  const [fiatList, setFiatList] = useState<IRampFiatItem[]>([]);
  const [defaultCryptoList, setDefaultCryptoList] = useState<IRampCryptoItem[]>([]);
  const [supportCryptoList, setSupportCryptoList] = useState<IRampCryptoItem[]>(defaultCryptoList);
  const filterFiatSelected = useMemo(() => {
    return fiatList.filter(
      (item) => item.symbol === (fiat || defaultFiat.symbol) && item.country === (country || defaultFiat.country),
    );
  }, [fiatList, fiat, defaultFiat.symbol, defaultFiat.country, country]);
  const filterCryptoSelected = useMemo(() => {
    return defaultCryptoList.filter(
      (item) => item.symbol === (crypto || defaultCrypto.symbol) && item.network === (network || defaultCrypto.network),
    );
  }, [defaultCryptoList, crypto, defaultCrypto.symbol, defaultCrypto.network, network]);

  // pay
  const [fiatAmount, setFiatAmount] = useState<string>(amount || defaultFiat.amount);
  const fiatAmountRef = useRef<string>(amount || defaultFiat.amount);
  const [fiatSelected, setFiatSelected] = useState<IRampFiatItem>({ ...filterFiatSelected[0] });
  const fiatSelectedRef = useRef<IRampFiatItem>({ ...filterFiatSelected[0] });

  // receive
  const [cryptoSelected, setCryptoSelected] = useState<IRampCryptoItem>({ ...filterCryptoSelected[0] });
  const cryptoSelectedRef = useRef<IRampCryptoItem>({ ...filterCryptoSelected[0] });

  // 15s interval
  const { receive, exchange, updateTime, errMsg, updateBuyReceive } = useUpdateReceiveAndInterval(RampType.BUY, {
    cryptoSelectedRef,
    fiatSelectedRef,
    fiatAmountRef,
  });

  const disabled = useMemo(() => !!errMsg || !fiatAmount, [errMsg, fiatAmount]);

  const showRateText = generateRateText(cryptoSelected.symbol, exchange, fiatSelected.symbol);

  const handleFiatChange = useCallback(
    async (v: string) => {
      fiatAmountRef.current = v;
      setFiatAmount(v);
      await updateBuyReceive();
    },
    [updateBuyReceive],
  );

  const handleFiatSelect = useCallback(
    async (v: IRampFiatItem) => {
      try {
        if (v.symbol && v.country) {
          setFiatSelected(v);
          fiatSelectedRef.current = v;

          // update crypto list and crypto default
          const { buyDefaultCrypto, buyCryptoList } = await getBuyCrypto({ fiat: v.symbol, country: v.country });
          const buyCryptoSelectedExit = buyCryptoList.filter(
            (item) =>
              item.symbol === cryptoSelectedRef.current.symbol && item.network === cryptoSelectedRef.current.network,
          );
          if (buyCryptoSelectedExit.length > 0) {
            // latest cryptoSelected - exit
            cryptoSelectedRef.current = buyCryptoSelectedExit[0];
          } else {
            // latest cryptoSelected - not exit
            const newDefaultCrypto = buyCryptoList.filter(
              (item) => item.symbol === buyDefaultCrypto.symbol && item.network === buyDefaultCrypto.network,
            );
            setCryptoSelected({ ...newDefaultCrypto[0] });
            cryptoSelectedRef.current = { ...newDefaultCrypto[0] };
          }

          setSupportCryptoList(buyCryptoList);

          await updateBuyReceive();
        }
      } catch (error) {
        console.log('handleFiatSelect error:', error);
      }
    },
    [updateBuyReceive],
  );

  const handleCryptoSelect = useCallback(
    async (v: IRampCryptoItem) => {
      try {
        if (v.symbol && v.network) {
          setCryptoSelected(v);
          cryptoSelectedRef.current = v;
          await updateBuyReceive();
        }
      } catch (error) {
        console.log('handleCryptoSelect error:', error);
      }
    },
    [updateBuyReceive],
  );

  const fetchDefaultBuyData = useCallback(async () => {
    const { buyFiatList, buyDefaultFiat, buyDefaultCryptoList, buyDefaultCrypto } = await getBuyData();

    setDefaultFiat(buyDefaultFiat);
    setFiatList(buyFiatList);
    setDefaultCrypto(buyDefaultCrypto);
    setDefaultCryptoList(buyDefaultCryptoList);
    setSupportCryptoList(buyDefaultCryptoList);

    // compute receive
    updateBuyReceive();
  }, [updateBuyReceive]);

  const fetchSpecifiedFiat = useCallback(async () => {
    if (crypto && tokenInfo?.symbol) return;
    try {
      setLoading(true);
      const fiatResult = await getSpecifiedBuyFiat({ crypto: crypto || tokenInfo?.symbol });
      if (fiatResult?.defaultFiat) {
        await handleFiatSelect(fiatResult?.defaultFiat);
        if (fiatResult?.defaultCrypto) {
          await handleCryptoSelect(fiatResult?.defaultCrypto);
        }
      }
    } catch (error) {
      console.log('fetchSpecifiedFiat error', error);
    } finally {
      setLoading(false);
    }
  }, [handleCryptoSelect, handleFiatSelect, crypto, tokenInfo?.symbol]);

  useEffectOnce(() => {
    // TODO ramp
    // fetchSpecifiedFiat();
    if (initialized) {
      fetchDefaultBuyData();
    }
  });

  const handleNext = useCallback(async () => {
    try {
      setLoading(true);

      // Compatible with the situation where the function is turned off when the user is on the page.
      const { isBuyShow } = await mixRampBuyShow({ isMainnet, isBuySectionShow, isFetch: true });
      setLoading(false);
      if (!isBuyShow) {
        singleMessage.error(SERVICE_UNAVAILABLE_TEXT);
        return onBack?.();
      }

      onShowPreview({
        initState: {
          crypto: cryptoSelectedRef.current.symbol,
          network: cryptoSelectedRef.current.network,
          fiat: fiatSelectedRef.current.symbol,
          country: fiatSelectedRef.current.country,
          amount: fiatAmountRef.current,
          side: RampType.BUY,
          tokenInfo,
        },
        chainId,
      });
    } catch (error) {
      console.log('go preview error:', error);
    } finally {
      setLoading(false);
    }
  }, [chainId, isBuySectionShow, isMainnet, onBack, onShowPreview, tokenInfo]);

  return (
    <>
      <div className="portkey-ui-ramp-buy-form portkey-ui-flex-column-center">
        <div className="portkey-ui-ramp-input">
          <div className="label">{`I want to pay`}</div>
          <FiatInput
            value={fiatAmount}
            readOnly={false}
            curFiat={fiatSelected}
            defaultCrypto={defaultCrypto}
            supportList={fiatList}
            onChange={handleFiatChange}
            onSelect={handleFiatSelect}
            onKeyDown={handleKeyDown}
          />
          {!!errMsg && <div className="error-text">{t(errMsg)}</div>}
        </div>
        <div className="portkey-ui-ramp-input">
          <div className="label">{`I will receive≈`}</div>
          <CryptoInput
            networkType={networkType}
            value={receive}
            curCrypto={cryptoSelected}
            readOnly={true}
            supportList={supportCryptoList}
            onSelect={handleCryptoSelect}
            onKeyDown={handleKeyDown}
          />
        </div>
        {exchange !== '' && !errMsg && <ExchangeRate showRateText={showRateText} rateUpdateTime={updateTime} />}
      </div>
      <div className="portkey-ui-ramp-footer">
        <Button type="primary" htmlType="submit" disabled={disabled} onClick={handleNext}>
          {t('Next')}
        </Button>
      </div>
    </>
  );
}
