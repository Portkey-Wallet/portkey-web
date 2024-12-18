import { useCallback, useMemo, useRef, useState } from 'react';
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
import { IRampCryptoItem, IRampFiatItem, RampType } from '@portkey/ramp';
import './index.less';
import { TokenItemShowType } from '../types/assets';
import { mixRampShow, transformAction } from './utils';
import { openloginSignal } from '@portkey/socket';
import { getCommunicationSocketUrl } from '../config-provider/utils';
import CommonInput from '../CommonInput';
import { getBuyCrypto, getSellCrypto } from './utils/api';
import useGAReport from '../../hooks/useGAReport';
import TokenImageDisplay from '../TokenImageDisplay';
import CustomSvg from '../CustomSvg';
import FiatInput from './components/FiatInput';
import RampPreview from './components/RampPreview';
import { useBuyCryptoList } from './hooks/hook';

export const enum RampStep {
  HOME,
  PREVIEW,
}
export default function RampMain({
  className,
  initState,
  tokenInfo,
  isMainnet,
  isBuySectionShow = true,
  isSellSectionShow = true,
  // isErrorTip = true,
  onBack,
  onShowPreview,
  // onModifyLimit,
  onModifyGuardians,
}: IRampProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(RampStep.HOME);
  // const [fiatList, setFiatList] = useState<IRampFiatItem[]>([]);
  // const { startReport, endReport } = useGAReport();
  const [keyword, setKeyword] = useState<string>('');
  const [{ initialized, caHash, originChainId }] = usePortkeyAsset();
  const [page, setPage] = useState<RampType>(initState?.side || RampType.BUY);
  const isSell = useRef(0); // guaranteed to make only one transfer
  const handleAchSell = useHandleAchSell({ tokenInfo });
  const [isBuyShow, setIsBuyShow] = useState<boolean>(isBuySectionShow);
  const [isSellShow, setIsSellShow] = useState<boolean>(isSellSectionShow);

  // const [initBuyState, setInitBuyState] = useState(initState?.side === RampType.BUY ? initState : {});
  // const [initSellState, setInitSellState] = useState(initState?.side === RampType.SELL ? initState : {});
  const [buyCryptoList, setBuyCryptoList] = useState<IRampCryptoItem[]>();
  const [sellCryptoList, setSellCryptoList] = useState<IRampCryptoItem[]>();
  const [selectedCrypto, setSelectedCrypto] = useState<IRampCryptoItem>();
  const fetchBuyCryptoList = useCallback(async () => {
    try {
      setLoading(true);
      const { buyCryptoList } = await getBuyCrypto({});
      setBuyCryptoList(buyCryptoList);
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchSellCryptoList = useCallback(async () => {
    try {
      setLoading(true);
      const { cryptoList } = await getSellCrypto({});
      setSellCryptoList(cryptoList);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffectOnce(() => {
    if (initialized) {
      fetchBuyCryptoList();
      fetchSellCryptoList();
    }
  });
  const list = useMemo(() => {
    if (page === RampType.BUY) {
      return buyCryptoList;
    }
    if (page === RampType.SELL) {
      return sellCryptoList;
    }
    return [];
  }, [buyCryptoList, page, sellCryptoList]);
  const filterList = useMemo(
    () => list?.filter((item) => item.symbol.toLocaleUpperCase().includes(keyword?.toLocaleUpperCase())),
    [keyword, list],
  );
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
            // setInitSellState({});
            setLoading(false);
          }
        } catch (error) {
          setLoading(false);

          const msg = handleErrorMessage(error);
          singleMessage.error(msg);
        } finally {
          setLoading(false);
        }
      } else {
        // setInitBuyState({});
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
      {step === RampStep.HOME && (
        <>
          <BackHeaderForPage
            title={
              <div className="portkey-ui-ramp-radio">
                <Radio.Group defaultValue={RampType.BUY} buttonStyle="solid" value={page} onChange={handlePageChange}>
                  <Radio.Button value={RampType.BUY} style={{ cursor: 'pointer' }}>
                    {t('Buy')}
                  </Radio.Button>
                  <Radio.Button value={RampType.SELL} style={{ cursor: 'pointer' }}>
                    {t('Sell')}
                  </Radio.Button>
                </Radio.Group>
              </div>
            }
            leftCallBack={onBack}
          />
          <div className="portkey-ui-ramp-content portkey-ui-flex-column-center">
            <CommonInput
              type="search"
              placeholder="Search"
              onChange={(e) => {
                const v = e.target.value.trim();
                setKeyword(v);
              }}
            />
            <ul style={{ width: '100%', marginTop: 16 }}>
              {filterList?.map((item, index) => (
                <li
                  key={index + '_' + item.symbol}
                  className="crypto-list-item"
                  onClick={() => {
                    setStep(RampStep.PREVIEW);
                    setSelectedCrypto(item);
                  }}>
                  <TokenImageDisplay src={item.icon} symbol={item.symbol} />
                  <span className="crypto-name">{item.symbol}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
      {step === RampStep.PREVIEW && selectedCrypto && list && (
        <RampPreview
          selectedCrypto={selectedCrypto}
          pageType={page}
          setStep={setStep}
          list={list}
          isMainnet={isMainnet}
          isSellShow={isSellShow}
          isBuyShow={isBuyShow}
          onBack={onBack}
          onShowPreview={onShowPreview}
        />
      )}
    </div>
  );
}
