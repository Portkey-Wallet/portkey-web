import { IRampCryptoItem, IRampFiatItem, RampType } from '@portkey/ramp';
import { getBuyLimit, getBuyPrice, getSellLimit, getSellPrice } from '../utils/api';
import { MutableRefObject, useCallback, useMemo, useRef, useState } from 'react';
import { INSUFFICIENT_FUNDS_TEXT, MAX_UPDATE_TIME, SYNCHRONIZING_CHAIN_TEXT } from '../../../constants/ramp';
import { IErrMsgHandlerParams } from '../../../types';
import { useEffectOnce } from 'react-use';
import { limitText, validValueCheck } from '../utils';
import { useCheckManagerSyncState } from '../../../hooks/wallet';
import { formatAmountShow } from '../../../utils/converter';
import { usePortkeyAsset } from '../../context/PortkeyAssetProvider';
import { ChainId } from '@portkey/types';

interface IUpdateReceiveAndIntervalProps {
  cryptoSelectedRef: MutableRefObject<IRampCryptoItem | undefined>;
  fiatSelectedRef: MutableRefObject<IRampFiatItem | undefined>;
  fiatAmountRef?: MutableRefObject<string>;
  cryptoAmountRef?: MutableRefObject<string>;
}

export const useUpdateReceiveAndInterval = (type: RampType, params: IUpdateReceiveAndIntervalProps) => {
  const [{ managementAccount, caHash }] = usePortkeyAsset();
  const checkManagerSyncState = useCheckManagerSyncState();

  const [receive, setReceive] = useState<string>('');
  const [exchange, setExchange] = useState<string>('');
  const [errMsg, setErrMsg] = useState<string>('');
  const [warningMsg, setWarningMsg] = useState<string>('');
  // const isShowMsg = useRef<boolean>(false);
  const [updateTime, setUpdateTime] = useState(MAX_UPDATE_TIME);
  const updateTimeRef = useRef(MAX_UPDATE_TIME);
  const updateTimerRef = useRef<NodeJS.Timer | number>();
  const isShowErrorRef = useRef(false);

  const { updateBuyReceive, updateSellReceive, handleSetTimer, stopInterval, resetTimer } = useMemo(() => {
    const updateBuyReceive = async () => {
      try {
        const { cryptoSelectedRef, fiatSelectedRef, fiatAmountRef } = params;
        if (!fiatAmountRef?.current) {
          setReceive('');
          setErrMsg('');
          setWarningMsg('');
          stopInterval();
          return;
        }

        await checkBuyLimit();
        if (!cryptoSelectedRef.current || !fiatSelectedRef.current) {
          return;
        }
        const { cryptoAmount, exchange } = await getBuyPrice({
          network: cryptoSelectedRef.current.network,
          crypto: cryptoSelectedRef.current.symbol,
          fiatAmount: fiatAmountRef.current,
          fiat: fiatSelectedRef.current.symbol,
          country: fiatSelectedRef.current.country,
        });

        setExchange(exchange);
        if (isShowErrorRef.current) return;
        setReceive(formatAmountShow(Number(cryptoAmount), 4));

        if (!updateTimerRef.current) {
          resetTimer();
        }
      } catch (error) {
        setReceive('');
        console.log('updateBuyReceive error:', error);
      }
    };

    const updateSellReceive = async () => {
      try {
        const { cryptoSelectedRef, fiatSelectedRef, cryptoAmountRef } = params;
        if (!cryptoSelectedRef.current || !fiatSelectedRef.current) {
          setReceive('');
          setErrMsg('');
          setWarningMsg('');
          stopInterval();
          return;
        }
        if (!cryptoAmountRef?.current) {
          setReceive('');
          setErrMsg('');
          setWarningMsg('');
          stopInterval();
          return;
        }

        await checkSellLimit();

        const { fiatAmount, exchange } = await getSellPrice({
          network: cryptoSelectedRef.current.network,
          crypto: cryptoSelectedRef.current.symbol,
          cryptoAmount: cryptoAmountRef.current,
          fiat: fiatSelectedRef.current.symbol,
          country: fiatSelectedRef.current.country,
        });

        setExchange(exchange);
        if (isShowErrorRef.current) return;
        setReceive(formatAmountShow(Number(fiatAmount), 4));

        if (!updateTimerRef.current) {
          resetTimer();
        }
      } catch (error) {
        setReceive('');
        console.log('updateSellReceive error:', error);
      }
    };

    const errMsgHandler = ({ min, max, symbol, amount }: IErrMsgHandlerParams) => {
      if (min !== null && max !== null) {
        if (!validValueCheck({ amount, min, max })) {
          setReceive('');
          stopInterval();
          setErrMsg(limitText({ symbol, min, max }));
          setWarningMsg('');
          isShowErrorRef.current = true;
        } else {
          setErrMsg('');
          setWarningMsg('');
          isShowErrorRef.current = false;
        }
      }
    };

    const checkBuyLimit = async () => {
      const { cryptoSelectedRef, fiatSelectedRef, fiatAmountRef } = params;
      if (!cryptoSelectedRef.current || !fiatSelectedRef.current) {
        return;
      }
      const { minLimit, maxLimit } = await getBuyLimit({
        crypto: cryptoSelectedRef.current.symbol,
        network: cryptoSelectedRef.current.network,
        fiat: fiatSelectedRef.current.symbol,
        country: fiatSelectedRef.current.country,
      });

      errMsgHandler({
        symbol: fiatSelectedRef.current.symbol,
        amount: fiatAmountRef?.current || '',
        min: minLimit,
        max: maxLimit,
      });
    };

    const checkSellLimit = async () => {
      const { cryptoSelectedRef, fiatSelectedRef, cryptoAmountRef } = params;
      if (!cryptoSelectedRef.current || !fiatSelectedRef.current) {
        return;
      }
      const { minLimit, maxLimit } = await getSellLimit({
        crypto: cryptoSelectedRef.current.symbol,
        network: cryptoSelectedRef.current.network,
        fiat: fiatSelectedRef.current.symbol,
        country: fiatSelectedRef.current.country,
      });

      errMsgHandler({
        symbol: cryptoSelectedRef.current.symbol,
        amount: cryptoAmountRef?.current || '',
        min: minLimit,
        max: maxLimit,
      });
    };

    const handleSetTimer = () => {
      updateTimerRef.current = setInterval(() => {
        --updateTimeRef.current;

        if (updateTimeRef.current === 0) {
          type === RampType.BUY ? updateBuyReceive() : updateSellReceive();
          updateTimeRef.current = MAX_UPDATE_TIME;
        }

        setUpdateTime(updateTimeRef.current);
      }, 1000);
    };

    const stopInterval = () => {
      clearInterval(updateTimerRef.current);
      updateTimerRef.current = undefined;
      setExchange('');
    };

    const resetTimer = () => {
      clearInterval(updateTimerRef.current);
      updateTimerRef.current = undefined;
      updateTimeRef.current = MAX_UPDATE_TIME;
      setUpdateTime(MAX_UPDATE_TIME);
      handleSetTimer();
    };

    return { updateBuyReceive, updateSellReceive, handleSetTimer, stopInterval, resetTimer };
  }, [params, type]);

  const setInsufficientFundsMsg = useCallback(() => {
    stopInterval();

    setErrMsg(INSUFFICIENT_FUNDS_TEXT);
    // isShowMsg.current = true;

    setReceive('');
  }, [stopInterval]);

  const checkManagerSynced = useCallback(
    async (chainId: ChainId) => {
      if (!caHash || !managementAccount?.address) throw 'Please login';
      const _isManagerSynced = await checkManagerSyncState(chainId, caHash, managementAccount?.address);

      if (!_isManagerSynced) {
        setWarningMsg(SYNCHRONIZING_CHAIN_TEXT);
        // isShowMsg.current = true;
      } else {
        setWarningMsg('');
      }
      return _isManagerSynced;
    },
    [caHash, checkManagerSyncState, managementAccount?.address],
  );

  useEffectOnce(() => {
    return () => {
      stopInterval();
    };
  });

  return {
    receive,
    setReceive,
    exchange,
    errMsg,
    warningMsg,
    updateTime,
    updateBuyReceive,
    updateSellReceive,
    handleSetTimer,
    stopInterval,
    resetTimer,
    setInsufficientFundsMsg,
    checkManagerSynced,
  };
};
