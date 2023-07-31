import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, message } from 'antd';
import { setLoading } from '../../utils';
import clsx from 'clsx';
import { RampTypeEnum } from '../../types';
import './index.less';
import {
  ACH_MERCHANT_NAME,
  AchConfig,
  DISCLAIMER_TEXT,
  MAX_UPDATE_TIME,
  RAMP_WEB_PAGE_ROUTE,
  SERVICE_UNAVAILABLE_TEXT,
  TransDirectEnum,
  initPreviewData,
} from '../../constants/ramp';
import BackHeaderForPage from '../BackHeaderForPage';
import CustomSvg from '../CustomSvg';
import { formatAmountShow } from '../../utils/converter';
import CustomModal from '../CustomModal';
import ConfigProvider from '../config-provider';
import { IRampPreviewProps } from '.';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { getOrderQuote } from '../Ramp/utils';
import { getAchSignature, getRampOrderNo } from './utils';
import { useGetAchTokenInfo } from './hooks';

export default function RampPreviewMain({
  state,
  goBack,
  isBuySectionShow = true,
  isSellSectionShow = true,
}: IRampPreviewProps) {
  const { t } = useTranslation();
  const updateRef = useRef(MAX_UPDATE_TIME);
  const [receive, setReceive] = useState('');
  const [rate, setRate] = useState('');
  const { appId, baseUrl, updateAchOrder } = AchConfig;
  const apiUrl = useMemo(() => ConfigProvider.config?.apiUrl, []);
  const data = useMemo(() => ({ ...initPreviewData, ...state }), [state]);
  const showRateText = useMemo(() => `1 ${data.crypto} ≈ ${formatAmountShow(rate, 2)} ${data.fiat}`, [data, rate]);
  const receiveText = useMemo(
    () => `I will receive ≈ ${formatAmountShow(receive)} ${data.side === RampTypeEnum.BUY ? data.crypto : data.fiat}`,
    [data, receive],
  );

  const getAchTokenInfo = useGetAchTokenInfo();

  const [{ guardianList, caInfo, originChainId }] = usePortkeyAsset();

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
      if (data.side === RampTypeEnum.SELL && fiatQuantity && rampFee) {
        const receive = Number(fiatQuantity) - Number(rampFee);
        setReceive(formatAmountShow(receive, 4));
      }
      if (data.side === RampTypeEnum.BUY) {
        setReceive(formatAmountShow(cryptoQuantity || '', 4));
      }
    },
    [data.side],
  );

  const updateReceive = useCallback(async () => {
    try {
      const rst = await getOrderQuote(data);
      const { cryptoPrice, fiatQuantity, rampFee, cryptoQuantity } = rst;
      setReceiveCase({ fiatQuantity, rampFee, cryptoQuantity });
      setRate(cryptoPrice);
    } catch (error) {
      console.log('error', error);
    }
  }, [data, setReceiveCase]);

  useEffect(() => {
    updateReceive();
  }, [updateReceive]);

  useEffect(() => {
    const timer = setInterval(() => {
      --updateRef.current;
      if (updateRef.current === 0) {
        updateReceive();
        updateRef.current = MAX_UPDATE_TIME;
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goPayPage = useCallback(async () => {
    const { side } = data;
    setLoading(true);

    // Compatible with the situation where the function is turned off when the user is on the page.
    if ((side === RampTypeEnum.BUY && !isBuySectionShow) || (side === RampTypeEnum.SELL && !isSellSectionShow)) {
      setLoading(false);
      message.error(SERVICE_UNAVAILABLE_TEXT);
      goBack?.();
    }

    if (!appId || !baseUrl) return setLoading(false);
    try {
      const { network, country, fiat, amount, crypto } = data;
      let openUrl = `${'http://localhost:3001/third-part-bridge'}/?url=${baseUrl}&crypto=${crypto}&network=${network}&country=${country}&fiat=${fiat}&appId=${appId}&callbackUrl=${encodeURIComponent(
        `${apiUrl}${updateAchOrder}`,
      )}`;

      const orderNo = await getRampOrderNo({
        transDirect: side === 'BUY' ? TransDirectEnum.TOKEN_BUY : TransDirectEnum.TOKEN_SELL,
        merchantName: ACH_MERCHANT_NAME,
      });
      openUrl += `&merchantOrderNo=${orderNo}`;

      if (side === RampTypeEnum.BUY) {
        // portkeyMethod is used by third-part-bridge, not ach
        openUrl += `&portkeyMethod=ACH_BUY&type=buy&fiatAmount=${amount}`;

        const achTokenInfo = await getAchTokenInfo(guardianList || []);
        if (achTokenInfo !== undefined) {
          openUrl += `&token=${encodeURIComponent(achTokenInfo.token)}`;
        }

        const address = caInfo[originChainId]?.caAddress || '';
        const signature = await getAchSignature({ address });
        openUrl += `&address=${address}&sign=${encodeURIComponent(signature)}`;
      } else {
        const withdrawUrl = encodeURIComponent(
          RAMP_WEB_PAGE_ROUTE + `&payload=${encodeURIComponent(JSON.stringify({ orderNo: orderNo }))}`,
        );

        // portkeyMethod is used by third-part-bridge, not ach
        openUrl += `&portkeyMethod=ACH_SELL&type=sell&cryptoAmount=${amount}&withdrawUrl=${withdrawUrl}&source=3#/sell-formUserInfo`;
      }

      const openWinder = window.open(openUrl, '_blank');

      console.log('openUrl', openUrl, openWinder);

      await new Promise((resolve) => setTimeout(resolve, 500));
      goBack?.();
    } catch (error) {
      message.error('There is a network error, please try again.');
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [
    apiUrl,
    appId,
    baseUrl,
    caInfo,
    data,
    getAchTokenInfo,
    goBack,
    guardianList,
    isBuySectionShow,
    isSellSectionShow,
    originChainId,
    updateAchOrder,
  ]);

  const showDisclaimerTipModal = useCallback(() => {
    CustomModal({
      content: (
        <>
          <div className="title">Disclaimer</div>
          {t(DISCLAIMER_TEXT)}
        </>
      ),
    });
  }, [t]);

  return (
    <div className={clsx(['preview-frame portkey-ui-flex-column'])}>
      <div className="preview-title">
        <BackHeaderForPage
          title={`${data.side === RampTypeEnum.BUY ? 'Buy' : 'Sell'} ${state.crypto}`}
          leftCallBack={goBack}
        />
      </div>
      <div className="preview-content">
        <div className="transaction portkey-ui-flex-column-center">
          <div className="send">
            <span className="amount">{formatAmountShow(data.amount)}</span>
            <span className="currency">{data.side === RampTypeEnum.BUY ? data.fiat : data.crypto}</span>
          </div>
          <div className="receive">{receiveText}</div>
        </div>
        <div className="card">
          <div className="label">{t('Service provider')}</div>
          <div className="card-item portkey-ui-flex-column">
            <div className="portkey-ui-flex-between-center ach">
              <CustomSvg type="RampAch" />
              <div className="rate">{showRateText}</div>
            </div>
            <div className="ach-pay">
              <CustomSvg type="RampPAY" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="disclaimer">
          <span>
            Proceeding with this transaction means that you have read and understood
            <span className="highlight" onClick={showDisclaimerTipModal}>
              &nbsp;the Disclaimer
            </span>
            .
          </span>
        </div>
      </div>
      <div className="preview-footer">
        <Button type="primary" htmlType="submit" onClick={goPayPage}>
          {t('Go to AlchemyPay')}
        </Button>
      </div>
    </div>
  );
}
