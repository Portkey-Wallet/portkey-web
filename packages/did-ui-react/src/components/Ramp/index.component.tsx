import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Radio, RadioChangeEvent } from 'antd';
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
  DEFAULT_CHAIN_ID,
  DEFAULT_SYMBOL,
} from '../../constants/ramp';
import { FiatType, PartialFiatType, RampDrawerType, RampTypeEnum } from '../../types';
import { divDecimals, formatAmountShow } from '../../utils/converter';
import BackHeaderForPage from '../BackHeaderForPage';
import CustomSvg from '../CustomSvg';
import { WalletError, handleErrorMessage, setLoading } from '../../utils';
import { handleKeyDown } from '../../utils/keyDown';
import CustomModal from '../CustomModal';
import { IRampProps } from '.';
import { fetchBuyFiatListAsync, fetchSellFiatListAsync, getOrderQuote, getCryptoInfo } from './utils';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { useHandleAchSell } from './hooks';
import { getBalanceByContract } from '../../utils/sandboxUtil/getBalance';
import { usePortkey } from '../context';
import { fetchTxFeeAsync } from '../../request/token';
import { getChain } from '../../hooks/useChainInfo';
import transferLimitCheck from '../ModalMethod/TransferLimitCheck';
import walletSecurityCheck from '../ModalMethod/WalletSecurityCheck';
import singleMessage from '../CustomAnt/message';
import './index.less';
import { OperationTypeEnum } from '@portkey/services';
import GuardianApprovalModal from '../GuardianApprovalModal';
import { GuardianApprovedItem } from '../Guardian/utils/type';
import { PORTKEY_OFF_RAMP_GUARDIANS_APPROVE_LIST } from '../../constants/storage';

export default function RampMain({
  className,
  initState,
  tokenInfo,
  portkeyWebSocketUrl,
  isMainnet,
  isBuySectionShow = true,
  isSellSectionShow = true,
  isErrorTip = true,
  onBack,
  onShowPreview,
  onModifyLimit,
  onModifyGuardians,
}: IRampProps) {
  const { t } = useTranslation();
  const updateTimeRef = useRef(MAX_UPDATE_TIME);
  const updateTimerRef = useRef<NodeJS.Timer | number>();
  const valueSaveRef = useRef({ ...initValueSave });
  const [errMsg, setErrMsg] = useState<string>('');
  const [warningMsg, setWarningMsg] = useState<string>('');
  const [page, setPage] = useState<RampTypeEnum>(RampTypeEnum.BUY);
  const [rate, setRate] = useState('');
  const [amount, setAmount] = useState(initCurrency);
  const [{ sandboxId, chainType, networkType }] = usePortkey();
  const [receive, setReceive] = useState('');
  const [curToken, setCurToken] = useState(initToken);
  const [curFiat, setCurFiat] = useState<PartialFiatType>(initFiat);
  const [rateUpdateTime, setRateUpdateTime] = useState(MAX_UPDATE_TIME);
  const [buyFiatList, setBuyFiatList] = useState<FiatType[]>([]);
  const [sellFiatList, setSellFiatList] = useState<FiatType[]>([]);
  const chainId = useMemo(() => tokenInfo?.chainId || DEFAULT_CHAIN_ID, [tokenInfo?.chainId]);
  const symbol = useMemo(() => tokenInfo?.symbol || DEFAULT_SYMBOL, [tokenInfo?.symbol]);
  const [approvalVisible, setApprovalVisible] = useState<boolean>(false);
  const [{ managementAccount, caInfo, initialized, caHash, originChainId }] = usePortkeyAsset();
  const isManagerSynced = useMemo(
    () => !!managementAccount?.address && managementAccount.address?.length > 0,
    [managementAccount?.address],
  );

  // ach transaction fee, default is 0.39
  const achFee = useRef<number>(0.39);

  const disabled = useMemo(() => !!errMsg || !amount, [errMsg, amount]);
  const showRateText = useMemo(
    () => `1 ${curToken.crypto} ≈ ${formatAmountShow(rate, 2)} ${curFiat.currency}`,
    [curFiat, curToken, rate],
  );

  const isSell = useRef(0); // guaranteed to make only one transfer
  const handleAchSell = useHandleAchSell({ isMainnet, tokenInfo, portkeyWebSocketUrl });

  useEffectOnce(() => {
    window.onmessage = function (event) {
      if (event.data.type === 'CHECK_SELL_RESULT') {
        checkAchSell(event.data.data);
      }
    };
    const checkAchSell = async (data: any) => {
      if (isSell.current === 0) {
        isSell.current = 1;
        const orderNo = JSON.parse(data?.payload).orderNo;
        await handleAchSell({ orderId: orderNo });
      }
    };
  });

  useEffect(() => {
    if (initialized) {
      fetchBuyFiatListAsync()
        .then((res) => {
          setBuyFiatList(res);
        })
        .catch((error) => {
          throw Error(JSON.stringify(error));
        });
      fetchSellFiatListAsync()
        .then((res) => {
          setSellFiatList(res);
        })
        .catch((error) => {
          throw Error(JSON.stringify(error));
        });

      fetchTxFeeAsync([chainId])
        .then((res) => {
          achFee.current = res[chainId].ach;
        })
        .catch((error) => {
          throw Error(JSON.stringify(error));
        });
    }
  }, [chainId, initialized]);

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
      if (initialized) {
        try {
          const rst = await getOrderQuote(params);
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
  }, [initialized, setReceiveCase]);

  const updateCrypto = useCallback(async () => {
    if (initialized) {
      const { currency, crypto, network, side } = valueSaveRef.current;
      const data = await getCryptoInfo({ fiat: currency }, crypto, network, side);
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
          valueSaveRef.current.min = Number(
            ZERO.plus(data.minSellAmount).decimalPlaces(4, BigNumber.ROUND_UP).valueOf(),
          );
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
    }
  }, [initialized, isValidValue, setErrMsgCase, stopInterval, updateReceive]);

  useEffect(() => {
    if (initialized) {
      if (initState && initState.amount !== undefined) {
        const { amount, country, fiat, crypto, network, side } = initState;
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
      } else if (initState && initState.side === RampTypeEnum.SELL) {
        // from sell entry
        setPage(RampTypeEnum.SELL);
        valueSaveRef.current.side = RampTypeEnum.SELL;
        setAmount(initCrypto);
        valueSaveRef.current.amount = initCrypto;
      } else {
        // default and from token detail
        if (!isBuySectionShow && isSellSectionShow) {
          const side = RampTypeEnum.SELL;
          setPage(side);
          valueSaveRef.current.side = side;
          setAmount(initCrypto);
          valueSaveRef.current.amount = initCrypto;

          // check security
          walletSecurityCheck({
            originChainId: originChainId,
            targetChainId: tokenInfo.chainId,
            caHash: caHash || '',
            onOk: onModifyGuardians,
          }).catch((error) => {
            const msg = handleErrorMessage(error);
            console.log('check security error: ', msg);
          });
        }
      }

      updateCrypto();

      return () => {
        clearInterval(updateTimerRef.current);
        updateTimerRef.current = undefined;
      };
    }
  }, [
    initialized,
    isBuySectionShow,
    isSellSectionShow,
    initState,
    updateCrypto,
    caHash,
    onModifyGuardians,
    originChainId,
    tokenInfo.chainId,
  ]);

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

      // check security
      if (side === RampTypeEnum.SELL) {
        try {
          setLoading(true);
          const res = await walletSecurityCheck({
            originChainId: originChainId,
            targetChainId: tokenInfo.chainId,
            caHash: caHash || '',
            onOk: onModifyGuardians,
          });
          if (!res) return setLoading(false);
        } catch (error) {
          setLoading(false);

          const msg = handleErrorMessage(error);
          singleMessage.error(msg);
        }
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
    [
      caHash,
      isBuySectionShow,
      isSellSectionShow,
      onModifyGuardians,
      originChainId,
      stopInterval,
      t,
      tokenInfo.chainId,
      updateCrypto,
    ],
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

  const handleCheckTransferLimit = useCallback(
    async (balance: string) => {
      try {
        if (!caInfo) return singleMessage.error('Please confirm whether to log in');
        const chainInfo = await getChain(tokenInfo.chainId);
        const privateKey = managementAccount?.privateKey;
        if (!privateKey) throw WalletError.invalidPrivateKey;
        if (!caHash) throw 'Please login';

        const { side, amount, currency, country, crypto, network } = valueSaveRef.current;
        const res = await transferLimitCheck({
          rpcUrl: chainInfo?.endPoint || '',
          caContractAddress: chainInfo?.caContractAddress || '',
          caHash: caHash,
          chainId: tokenInfo.chainId,
          symbol: tokenInfo.symbol,
          amount: amount,
          decimals: tokenInfo.decimals,
          businessFrom: {
            module: 'ramp-sell',
            extraConfig: {
              crypto,
              network,
              fiat: currency,
              country,
              amount,
              side,
            },
          },
          balance,
          chainType,
          tokenContractAddress: tokenInfo.tokenContractAddress || '',
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
    [
      caHash,
      caInfo,
      chainId,
      chainType,
      managementAccount?.privateKey,
      onModifyLimit,
      tokenInfo.chainId,
      tokenInfo.decimals,
      tokenInfo.symbol,
      tokenInfo.tokenContractAddress,
    ],
  );

  const showPreview = useCallback(() => {
    const { side, amount, currency, country, crypto, network } = valueSaveRef.current;
    onShowPreview({
      initState: {
        crypto,
        network,
        fiat: currency,
        country,
        amount,
        side,
      },
      chainId: chainId,
    });
  }, [chainId, onShowPreview]);

  const onApprovalSuccess = useCallback(
    (approveList: GuardianApprovedItem[]) => {
      try {
        if (Array.isArray(approveList) && approveList.length > 0) {
          console.log('approveList', approveList);
          localStorage.setItem(PORTKEY_OFF_RAMP_GUARDIANS_APPROVE_LIST, JSON.stringify(approveList));
          setApprovalVisible(false);
          showPreview();
        } else {
          // TODO sell throw error
        }
      } catch (error) {
        // TODO sell throw error
      }
    },
    [showPreview],
  );

  const handleNext = useCallback(async () => {
    const { side } = valueSaveRef.current;
    if (!caInfo) return singleMessage.error('Please confirm whether to log in');

    setLoading(true);

    // CHECK 1: is show buy\sell
    // Compatible with the situation where the function is turned off when the user is on the page.
    if ((side === RampTypeEnum.BUY && !isBuySectionShow) || (side === RampTypeEnum.SELL && !isSellSectionShow)) {
      setLoading(false);
      singleMessage.error(SERVICE_UNAVAILABLE_TEXT);
      return onBack?.();
    }

    if (side === RampTypeEnum.SELL) {
      if (!isManagerSynced) {
        setLoading(false);
        setWarningMsg(SYNCHRONIZING_CHAIN_TEXT);
        return;
      } else {
        setWarningMsg('');
      }

      try {
        // CHECK 2: security
        const securityRes = await walletSecurityCheck({
          originChainId: originChainId,
          targetChainId: tokenInfo.chainId,
          caHash: caHash || '',
          onOk: onModifyGuardians,
        });
        if (!securityRes) return setLoading(false);

        // CHECK 4: balance, search balance from contract
        const result = await getBalanceByContract({
          sandboxId,
          chainType,
          chainId: chainId,
          tokenContractAddress: tokenInfo.tokenContractAddress || '',
          paramsOption: {
            owner: caInfo[chainId]?.caAddress || '',
            symbol: symbol,
          },
        });

        setLoading(false);
        const balance = result.balance;

        if (
          ZERO.plus(divDecimals(balance, tokenInfo.decimals)).isLessThanOrEqualTo(
            ZERO.plus(achFee.current).plus(valueSaveRef.current.amount),
          )
        ) {
          setInsufficientFundsMsg();
          return;
        }

        // CHECK 3: transfer limit
        const limitRes = await handleCheckTransferLimit(balance);
        if (!limitRes) return setLoading(false);
      } catch (error) {
        const msg = handleErrorMessage(error);
        singleMessage.error(msg);

        setLoading(false);
        return;
      }
    }

    setLoading(false);

    showPreview();
  }, [
    caInfo,
    isBuySectionShow,
    isSellSectionShow,
    showPreview,
    onBack,
    isManagerSynced,
    originChainId,
    tokenInfo.chainId,
    tokenInfo.tokenContractAddress,
    tokenInfo.decimals,
    caHash,
    onModifyGuardians,
    sandboxId,
    chainType,
    chainId,
    symbol,
    handleCheckTransferLimit,
    setInsufficientFundsMsg,
  ]);

  const renderRate = useMemo(
    () => (
      <div className="portkey-ui-ramp-rate portkey-ui-flex-between-center">
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
    <div className={clsx(['portkey-ui-ramp-frame portkey-ui-flex-column', className])} id="portkey-ui-ramp">
      <BackHeaderForPage title={t('Buy')} leftCallBack={onBack} />
      <div className="portkey-ui-ramp-content portkey-ui-flex-column-center">
        <div className="portkey-ui-ramp-radio">
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
            fiatList={buyFiatList}
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
            fiatList={sellFiatList}
          />
        )}
        {rate !== '' && renderRate}
      </div>
      <div className="portkey-ui-ramp-footer">
        <Button type="primary" htmlType="submit" disabled={disabled} onClick={handleNext}>
          {t('Next')}
        </Button>
      </div>

      <GuardianApprovalModal
        open={approvalVisible}
        networkType={networkType}
        caHash={caHash || ''}
        originChainId={originChainId}
        targetChainId={tokenInfo.chainId}
        operationType={OperationTypeEnum.transferApprove}
        isErrorTip={isErrorTip}
        sandboxId={sandboxId}
        onClose={() => setApprovalVisible(false)}
        onBack={() => setApprovalVisible(false)}
        onApprovalSuccess={onApprovalSuccess}
      />
    </div>
  );
}
