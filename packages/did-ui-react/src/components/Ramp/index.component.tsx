import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Radio, RadioChangeEvent } from 'antd';
import { useEffectOnce } from 'react-use';
import clsx from 'clsx';
import BuyForm from './components/BuyForm';
import SellForm from './components/SellForm';
import { BUY_SOON_TEXT, SELL_SOON_TEXT } from '../../constants/ramp';
import BackHeaderForPage from '../BackHeaderForPage';
import { handleErrorMessage, setLoading } from '../../utils';
import CustomModal from '../CustomModal';
import { IRampProps } from '.';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import useHandleAchSell from './hooks/useHandleAchSell';
import walletSecurityCheck from '../ModalMethod/WalletSecurityCheck';
import singleMessage from '../CustomAnt/message';
import { RampType } from '@portkey/ramp';
import './index.less';
import { TokenItemShowType } from '../types/assets';
import { mixRampShow } from './utils';
import { openloginSignal } from '@portkey/socket';
import { getCommunicationSocketUrl } from '../config-provider/utils';

export default function RampMain({
  className,
  initState,
  tokenInfo,
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
  const [{ initialized, caHash, originChainId }] = usePortkeyAsset();
  const [page, setPage] = useState<RampType>(initState?.side || RampType.BUY);
  const isSell = useRef(0); // guaranteed to make only one transfer
  const handleAchSell = useHandleAchSell({ tokenInfo });
  const [isBuyShow, setIsBuyShow] = useState<boolean>(isBuySectionShow);
  const [isSellShow, setIsSellShow] = useState<boolean>(isSellSectionShow);

  const [initBuyState, setInitBuyState] = useState(initState?.side === RampType.BUY ? initState : {});
  const [initSellState, setInitSellState] = useState(initState?.side === RampType.SELL ? initState : {});

  useEffectOnce(() => {
    if (initialized) {
      mixRampShow({ isMainnet, isBuySectionShow, isSellSectionShow, isFetch: true })
        .then((res) => {
          const { isBuyShow, isSellShow } = res;

          setIsBuyShow(isBuyShow);
          setIsSellShow(isSellShow);

          if (!isBuyShow && isSellShow) {
            const side = RampType.SELL;
            setPage(side);
          }
        })
        .catch((err) => {
          throw Error(err);
        });
    }

    const clientId = initState?.openloginSignalClientId;
    if (initState?.side === RampType.SELL && clientId) {
      try {
        openloginSignal
          .doOpen({
            url: getCommunicationSocketUrl(),
            clientId,
          })
          .then(() => {
            setLoading(true);
            openloginSignal.onCheckSellResult({ requestId: clientId }, (result: any) => {
              if (!result) return;
              try {
                const data = JSON.parse(result);
                setLoading(false);
                checkAchSell(data);
              } catch (error) {
                singleMessage.error(handleErrorMessage(error));
              }
              openloginSignal.destroy();
            });
          });
      } catch (error) {
        singleMessage.error(handleErrorMessage(error));
      }
      const checkAchSell = async (data: any) => {
        if (isSell.current === 0 && typeof data?.payload === 'string' && data?.payload?.length > 0) {
          isSell.current = 1;
          const orderNo = JSON.parse(data?.payload)?.orderNo;
          await handleAchSell({ orderId: orderNo, isMainnet });
        }
      };
    }
  });

  const handlePageChange = useCallback(
    async (e: RadioChangeEvent) => {
      // fetch on\off ramp is display
      mixRampShow({
        isMainnet,
        isBuySectionShow,
        isSellSectionShow,
        isFetch: true,
      }).then((res) => {
        const { isBuyShow, isSellShow } = res;
        setIsBuyShow(isBuyShow);
        setIsSellShow(isSellShow);
      });

      const side = e.target.value;
      // Compatible with the situation where the function is turned off when the user is on the page.
      if (side === RampType.BUY && !isBuyShow) {
        CustomModal({
          content: t(BUY_SOON_TEXT),
        });
        return;
      }
      if (side === RampType.SELL && !isSellShow) {
        CustomModal({
          content: t(SELL_SOON_TEXT),
        });
        return;
      }

      // check security
      if (side === RampType.SELL) {
        try {
          setLoading(true);
          const res = await walletSecurityCheck({
            originChainId: originChainId,
            targetChainId: tokenInfo.chainId,
            caHash: caHash || '',
            onOk: onModifyGuardians,
          });
          if (!res) {
            setInitSellState({});
            setLoading(false);
          }
        } catch (error) {
          setLoading(false);

          const msg = handleErrorMessage(error);
          singleMessage.error(msg);
        }
      } else {
        setInitBuyState({});
      }

      setPage(side);
    },
    [
      caHash,
      isBuySectionShow,
      isBuyShow,
      isMainnet,
      isSellSectionShow,
      isSellShow,
      onModifyGuardians,
      originChainId,
      t,
      tokenInfo.chainId,
    ],
  );

  return (
    <div className={clsx(['portkey-ui-ramp-frame portkey-ui-flex-column', className])} id="portkey-ui-ramp">
      <BackHeaderForPage title={t('Buy')} leftCallBack={onBack} />
      <div className="portkey-ui-ramp-content portkey-ui-flex-column-center">
        <div className="portkey-ui-ramp-radio">
          <Radio.Group defaultValue={RampType.BUY} buttonStyle="solid" value={page} onChange={handlePageChange}>
            <Radio.Button value={RampType.BUY}>{t('Buy')}</Radio.Button>
            <Radio.Button value={RampType.SELL}>{t('Sell')}</Radio.Button>
          </Radio.Group>
        </div>
        {page === RampType.BUY && (
          <BuyForm
            isMainnet={isMainnet}
            isBuySectionShow={isBuySectionShow}
            crypto={initBuyState?.crypto}
            cryptoIcon={initBuyState?.cryptoIcon}
            network={initBuyState?.network}
            fiat={initBuyState?.fiat}
            country={initBuyState?.country}
            countryName={initBuyState?.countryName}
            fiatIcon={initBuyState?.fiatIcon}
            amount={initBuyState?.amount}
            tokenInfo={tokenInfo as TokenItemShowType}
            onBack={onBack}
            onShowPreview={onShowPreview}
          />
        )}
        {page === RampType.SELL && (
          <SellForm
            isMainnet={isMainnet}
            isSellSectionShow={isSellSectionShow}
            crypto={initSellState?.crypto}
            cryptoIcon={initBuyState?.cryptoIcon}
            network={initSellState?.network}
            fiat={initSellState?.fiat}
            country={initSellState?.country}
            countryName={initSellState?.countryName}
            fiatIcon={initBuyState?.fiatIcon}
            amount={initSellState?.amount}
            tokenInfo={tokenInfo as TokenItemShowType}
            isErrorTip={isErrorTip}
            onBack={onBack}
            onShowPreview={onShowPreview}
            onModifyLimit={onModifyLimit}
            onModifyGuardians={onModifyGuardians}
          />
        )}
      </div>
    </div>
  );
}
