import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { did, randomId, setLoading } from '../../utils';
import clsx from 'clsx';
import { ramp, IRampProviderType, RampType } from '@portkey/ramp';
import './index.less';
import {
  DISCLAIMER_TEXT,
  InitProviderSelected,
  MAX_UPDATE_TIME,
  RAMP_WITH_DRAW_URL,
  SERVICE_UNAVAILABLE_TEXT,
  initPreviewData,
} from '../../constants/ramp';
import BackHeaderForPage from '../BackHeaderForPage';
import CustomSvg from '../CustomSvg';
import { formatAmountShow } from '../../utils/converter';
import CustomModal from '../CustomModal';
import { IRampPreviewProps } from '.';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import singleMessage from '../CustomAnt/message';
import { PORTKEY_OFF_RAMP_GUARDIANS_APPROVE_LIST } from '../../constants/storage';
import ThrottleButton from '../ThrottleButton';
import { IGetBuyDetail, IGetSellDetail, getBuyDetail, getSellDetail } from '../Ramp/utils/api';
import { generateRateText, generateReceiveText, mixRampShow } from '../Ramp/utils';
import { AccountTypeKeyEnum } from '@portkey/services';
import { sleep } from '@portkey/utils';
import { MAIN_CHAIN_ID } from '../../constants/network';
import { usePortkey } from '../context';
import CommonModal from '../CommonModal';
import CommonButton from '../CommonButton';
import CommonPromptCard, { PromptCardType } from '../CommonPromptCard';

export default function RampPreviewMain({
  className,
  initState,
  chainId = MAIN_CHAIN_ID,
  isMainnet,
  isBuySectionShow = true,
  isSellSectionShow = true,
  onBack,
}: IRampPreviewProps) {
  const { t } = useTranslation();
  const [openDisclaimerTipModal, setOpenDisclaimerTipModal] = useState<boolean>(false);
  const updateRef = useRef(MAX_UPDATE_TIME);
  const [receive, setReceive] = useState('');
  const [providerList, setProviderList] = useState<Array<IGetBuyDetail | IGetSellDetail>>([]);
  const [providerSelected, setProviderSelected] = useState<IGetBuyDetail | IGetSellDetail>(InitProviderSelected);
  const providerSelectedKey = useRef<IRampProviderType>(InitProviderSelected.thirdPart);
  const initData = useMemo(() => {
    return { ...initPreviewData, ...initState };
  }, [initState]);
  const receiveText = useMemo(
    () => receive && generateReceiveText(receive, initData.side === RampType.BUY ? initData.crypto : initData.fiat),
    [initData.crypto, initData.fiat, initData.side, receive],
  );
  const disabled = useMemo(
    () => providerList.length > 0 && !!providerSelected?.thirdPart,
    [providerList.length, providerSelected?.thirdPart],
  );

  const onSwitchProvider = useCallback((provider: IGetBuyDetail | IGetSellDetail) => {
    providerSelectedKey.current = provider.thirdPart;
    setProviderSelected(provider);
    setReceive(provider.amount);
  }, []);

  const getRampDetail = useCallback(
    async (init = false) => {
      try {
        let canUseProviders: Array<IGetBuyDetail | IGetSellDetail> = [];
        if (initData.side === RampType.BUY) {
          canUseProviders = await getBuyDetail({
            network: initData.network,
            crypto: initData.crypto,
            fiat: initData.fiat,
            country: initData.country,
            fiatAmount: initData.amount,
          });
        } else {
          canUseProviders = await getSellDetail({
            network: initData.network,
            crypto: initData.crypto,
            fiat: initData.fiat,
            country: initData.country,
            cryptoAmount: initData.amount,
          });
        }
        if (!Array.isArray(canUseProviders)) return;
        if (init && canUseProviders[0]?.thirdPart) {
          providerSelectedKey.current = canUseProviders[0]?.thirdPart;
        }

        setProviderList(canUseProviders);
        const providerSelectedExit = canUseProviders.filter((item) => item?.thirdPart === providerSelectedKey.current);
        if (providerSelectedExit.length === 0) {
          // providerSelected not exit
          onSwitchProvider(canUseProviders[0]);
        } else {
          onSwitchProvider(providerSelectedExit[0]);
        }
      } catch (error) {
        console.log('getRampDetail error:', error);
      }
    },
    [
      initData.amount,
      initData.country,
      initData.crypto,
      initData.fiat,
      initData.network,
      initData.side,
      onSwitchProvider,
    ],
  );

  useEffect(() => {
    getRampDetail(true);
  }, [getRampDetail]);

  useEffect(() => {
    const timer = setInterval(() => {
      --updateRef.current;
      if (updateRef.current === 0) {
        getRampDetail();
        updateRef.current = MAX_UPDATE_TIME;
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [{ guardianList, caInfo }] = usePortkeyAsset();
  const [{ networkType }] = usePortkey();
  const goPayPage = useCallback(async () => {
    if (!providerSelected?.providerInfo) return;
    const { side } = initData;
    if (!caInfo) return singleMessage.error('Please confirm whether to log in');

    setLoading(true);
    const { isBuyShow, isSellShow } = await mixRampShow({ isMainnet, isBuySectionShow, isSellSectionShow });
    // Compatible with the situation where the function is turned off when the user is on the page.
    if ((side === RampType.BUY && !isBuyShow) || (side === RampType.SELL && !isSellShow)) {
      setLoading(false);
      singleMessage.error(SERVICE_UNAVAILABLE_TEXT);
      onBack?.(initData);
    }

    try {
      const provider = ramp.getProvider(providerSelected.providerInfo.key);
      if (!provider) throw new Error('Failed to get ramp provider');

      if (guardianList === undefined) {
        throw new Error('userGuardiansList is undefined');
      }
      const emailGuardian = guardianList?.find(
        (item) => item.type === AccountTypeKeyEnum.Email && item.isLoginGuardian,
      );

      const { country, fiat, amount, crypto } = initData;
      const clientId = randomId();
      const { url, orderId } = await provider.createOrder({
        type: side,
        address: caInfo[chainId]?.caAddress || '',
        email: emailGuardian?.guardianIdentifier,
        crypto: providerSelected.providerSymbol || crypto,
        network: providerSelected.providerNetwork,
        country: country,
        fiat: fiat,
        amount: amount,
        withdrawUrl: RAMP_WITH_DRAW_URL,
        clientId,
        networkType,
      });

      if (Array.isArray(initData?.approveList) && initData?.approveList.length > 0) {
        await did.config.storageMethod.setItem(
          `${PORTKEY_OFF_RAMP_GUARDIANS_APPROVE_LIST}_${orderId}`,
          JSON.stringify(initState.approveList),
        );
      }

      window.open(url, '_blank');

      sleep(500);
      onBack?.({ ...initData, openloginSignalClientId: clientId });
    } catch (error) {
      singleMessage.error('There is a network error, please try again.');
    } finally {
      setLoading(false);
    }
  }, [
    providerSelected.providerInfo,
    providerSelected.providerSymbol,
    providerSelected.providerNetwork,
    initData,
    caInfo,
    isMainnet,
    isBuySectionShow,
    isSellSectionShow,
    onBack,
    guardianList,
    chainId,
    networkType,
    initState.approveList,
  ]);

  const showDisclaimerTipModal = useCallback(() => {
    setOpenDisclaimerTipModal(true);
  }, []);

  const renderProviderList = useMemo(() => {
    return providerList.length > 0 ? (
      <div className="portkey-ui-ramp-provider-card">
        <div className="portkey-ui-ramp-provider-label">{t('Select provider:')}</div>
        {providerList.map((item) => (
          <div
            className={clsx([
              'portkey-ui-ramp-provider-card-item',
              providerSelected?.providerInfo.key === item?.providerInfo.key &&
                'portkey-ui-ramp-provider-card-item-selected',
              'portkey-ui-flex-column',
            ])}
            key={item?.providerInfo.key}
            onClick={() => onSwitchProvider(item)}>
            <div className="portkey-ui-flex-row-center portkey-ui-ramp-provider">
              <img src={item?.providerInfo.logo} className="portkey-ui-ramp-provider-logo" />
              <div className="rate">{generateRateText(initData.crypto, item.exchange, initData.fiat)}</div>
            </div>
            <div className="portkey-ui-ramp-provider-pay">
              {item?.providerInfo.paymentTags.map((tag, index) => (
                <img src={tag} key={'paymentTags-' + index} className="portkey-ui-ramp-provider-pay-item" />
              ))}
            </div>
            {providerSelected?.providerInfo.key === item?.providerInfo.key && (
              <CustomSvg type="CheckCircle" className="card-selected-icon" />
            )}
          </div>
        ))}
      </div>
    ) : null;
  }, [initData.crypto, initData.fiat, onSwitchProvider, providerList, providerSelected?.providerInfo.key, t]);

  const renderFooter = useMemo(() => {
    return providerSelected?.providerInfo.name ? (
      // TODO footer
      <div className="portkey-ui-ramp-preview-footer">
        {/* <div className="portkey-ui-ramp-preview-disclaimer">
          <span>
            By proceeding, you acknowledge that you have read and understood the
            <span className="highlight" onClick={showDisclaimerTipModal}>
              &nbsp;Disclaimer
            </span>
            .
          </span>
        </div> */}
        <CommonPromptCard
          className="portkey-ui-ramp-preview-disclaimer"
          type={PromptCardType.INFO}
          description={
            <span>
              By proceeding, you acknowledge that you have read and understood the
              <span className="highlight" onClick={showDisclaimerTipModal}>
                &nbsp;Disclaimer
              </span>
              .
            </span>
          }
        />
        <ThrottleButton type="primary" htmlType="submit" onClick={goPayPage} disabled={!disabled} block>
          {initData.side === RampType.BUY ? 'Buy' : 'Sell'}
        </ThrottleButton>
      </div>
    ) : null;
  }, [disabled, goPayPage, initData.side, providerSelected?.providerInfo.name, showDisclaimerTipModal]);

  return (
    <div className={clsx(['portkey-ui-ramp-preview-frame portkey-ui-flex-column', className])}>
      <BackHeaderForPage
        title={`${initData.side === RampType.BUY ? 'Buy' : 'Sell'} ${initState.crypto}`}
        leftCallBack={() => onBack?.(initData)}
      />
      <div className="portkey-ui-ramp-preview-content">
        <div className="transaction portkey-ui-flex-column-center">
          <div className="send">
            <span className="amount">{formatAmountShow(initData.amount)}</span>
            <span className="currency">{initData.side === RampType.BUY ? initData.fiat : initData.crypto}</span>
          </div>
          <div className="receive">{receiveText}</div>
        </div>
        {renderProviderList}
      </div>
      {renderFooter}
      <CommonModal
        className="disclaimer-tip-modal"
        height={'auto'}
        open={openDisclaimerTipModal}
        onClose={() => {
          setOpenDisclaimerTipModal(false);
        }}>
        <div className="disclaimer-tip-wrapper">
          <div className="disclaimer-tip-title">Disclaimer</div>
          <span className="disclaimer-tip-content">
            {providerSelected?.providerInfo.name + DISCLAIMER_TEXT + providerSelected?.providerInfo.name + ' services.'}
          </span>
          <CommonButton
            type="primary"
            block
            onClick={() => {
              setOpenDisclaimerTipModal(false);
            }}>
            Close
          </CommonButton>
        </div>
      </CommonModal>
    </div>
  );
}
