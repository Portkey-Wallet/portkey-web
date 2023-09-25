import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { did, handleErrorMessage, isValidEmail, randomId } from '../../../utils';
import { message } from 'antd';
import { ErrorInfo } from '../../../types';
import { AccountTypeEnum, AchNFTOrderInfo, GetAchNFTSignatureParams } from '@portkey/services';
import { stringifyUrl } from 'query-string';
import { sleep } from '@portkey/utils';
import { signalrSell, OrderStatusEnum } from '@portkey/socket';
import { getServiceUrl, getSocketUrl } from '../../config-provider/utils';
import { DAY, WEB_PAGE } from '../../../constants';
import { ChainId } from '@portkey/types';
import LoadingIndicator from '../../Loading';
import { NFTCheckoutByACH, NFTTransDirectEnum } from '../../../constants/ramp';
import ResultInner from '../ResultInner';
import { ISocialMedia } from '../../types/social';
import { SOCIAL_MEDIA } from '../../../constants/media';
import './index.less';

const preFixCls = 'portkey-ui-ach-checkout';

export interface IFinishResult {
  status: 'success' | 'fail';
  data: {
    orderId: string;
    nftSymbol?: string;
    collectionName?: string;
  };
}

interface ACHCheckoutProps {
  appId: string;
  type?: `${NFTCheckoutByACH}`;
  orderId: string;
  targetFiat?: string;
  transDirect?: `${NFTTransDirectEnum}`;
  rampWebUrl: string;
  originChainId: ChainId;
  socialMedia?: ISocialMedia[];
  onError?: (error: ErrorInfo<Error>) => void;
  onCancel?: () => void;
  onFinish?: (result: IFinishResult) => void;
}

export enum NFTCheckoutStatus {
  Start,
  Finish,
  Failed,
}

export default function ACHCheckout({
  appId,
  orderId,
  rampWebUrl,
  originChainId,
  targetFiat = 'USD',
  type = NFTCheckoutByACH.MARKET,
  transDirect = NFTTransDirectEnum.NFT_SELL,
  socialMedia = SOCIAL_MEDIA,
  onCancel,
  onError,
  onFinish,
}: ACHCheckoutProps) {
  const [iframeUrl, setIframeUrl] = useState<any>();
  const [orderStatus, setOrderStatus] = useState<NFTCheckoutStatus>(NFTCheckoutStatus.Start);

  const [orderInfo, setOrderInfo] = useState<AchNFTOrderInfo>();
  const getSignature = useCallback(async (params: GetAchNFTSignatureParams) => {
    const rst = await did.services.ramp.getAchNFTSignature(params);

    if (rst.returnCode !== '0000' || !rst?.data) {
      throw new Error(rst.returnMsg);
    }

    return rst.data as string;
  }, []);

  const callbackUrl = useMemo(() => `${getServiceUrl()}`, []);

  const getGuardianList = useCallback(async () => {
    if (!did.didWallet.caInfo[originChainId].caHash) throw 'Please sign in';
    const payload = await did.getHolderInfo({
      chainId: originChainId,
      caHash: did.didWallet.caInfo[originChainId].caHash,
    });

    const { guardians } = payload?.guardianList ?? { guardians: [] };
    return guardians;
  }, [originChainId]);

  const getACHToken = useCallback(async () => {
    try {
      const guardianList = await getGuardianList();

      const emailGuardian = guardianList?.find(
        (item) => item.type === AccountTypeEnum[AccountTypeEnum.Email] && item.isLoginGuardian,
      );
      if (emailGuardian === undefined || !isValidEmail(emailGuardian?.guardianIdentifier)) {
        return undefined;
      }

      const rst = await did.services.ramp.getAchNFTToken({ email: emailGuardian.guardianIdentifier });

      if (rst.returnCode !== '0000') {
        throw new Error(rst.returnMsg);
      }
      return rst.data;
    } catch (error) {
      console.error('getACHToken:', error);
      return undefined;
    }
  }, [getGuardianList]);

  const getOrderInfo = useCallback(async () => {
    const result = await did.services.ramp.getAchNFTOrderInfoByOrderId({
      orderId,
      skipCount: 0,
      maxResultCount: 10,
    });
    return result.data[0];
  }, [orderId]);

  const redirectRef = useRef<string>();

  const initParams = useCallback(async () => {
    try {
      const orderInfo = await getOrderInfo();
      if (!orderInfo) throw Error('Please check your orderId');
      console.log(orderInfo, 'orderInfo===');
      const redirectUrl = `${WEB_PAGE}/ach-nft-checkout-callback?transDirect=${transDirect}&orderId=${orderInfo.id}`;
      redirectRef.current = redirectUrl;
      // params: https://alchemypay.readme.io/docs/create-order-1
      const getSignatureParams: GetAchNFTSignatureParams = {
        appId,
        timestamp: orderInfo.nftOrderSection.createTime || Math.floor(Date.now()).toString(),
        timeout: orderInfo.nftOrderSection?.expireTime || Math.floor(Date.now() + DAY).toString(), // time going to expire, UTC,13 digit
        crypto: orderInfo.crypto, // ELF/ETH.etc ELF default. Required parameter for crypto-based
        cryptoAmount: orderInfo.cryptoPrice, // Total NFT oder crypto amount，Required parameter for crypto-based
        network: orderInfo.network || 'ELF', // Parameter for crypto-based Real-time settlement
        targetFiat,
        type,
        uniqueId: orderInfo.id, // NFT Unique Identity, Required for NFT type MARKET 🔺
        quantity: orderInfo?.cryptoQuantity || 1, // NFT quantity, Required for NFT type MINT 🔺
        name: orderInfo.nftOrderSection?.nftSymbol, // NFT name
        picture: orderInfo.nftOrderSection?.nftPicture, // NFT pic rendering URL, 220px * 220 px
        redirectUrl: redirectUrl, // Redirect URL after buying NFT succeed
        callbackUrl: callbackUrl, // Webhook URL to get the notify message from Alchemy Pay
        merchantOrderNo: orderInfo.id, // Merchant defined order ID
        // merchantName: orderInfo.nftOrderSection?.merchantName || 'Alchemy', // Merchant name
      } as any;

      const [signature, token] = await Promise.all([getSignature(getSignatureParams), getACHToken()]);
      const query: any = {
        ...getSignatureParams,
        signature: signature,
      };
      if (token) {
        if (token.accessToken) query.token = token.accessToken;
        if (token.email) query.email = token.email;
        if (token.id) query.id = token.id;
      }
      setOrderInfo(orderInfo);
      const url = stringifyUrl(
        {
          url: rampWebUrl,
          query,
        },
        { encode: true },
      );
      console.log(query, url, token, 'query===');

      setIframeUrl(url);
    } catch (error) {
      message.error(handleErrorMessage(error));
      onError?.({
        errorFields: 'ACH NFT checkout init params',
        error: Error(handleErrorMessage(error)),
      });
    }
  }, [getOrderInfo, transDirect, appId, targetFiat, type, callbackUrl, getSignature, getACHToken, rampWebUrl, onError]);

  useEffect(() => {
    initParams();
  }, [initParams]);

  const orderStatusHandler = useCallback(
    async (orderId: string) => {
      try {
        const clientId = randomId();

        await signalrSell.doOpen({
          url: getSocketUrl(),
          clientId,
        });

        await signalrSell.requestNFTOrderStatus(clientId, orderId);

        signalrSell.OnNFTOrderChanged({ orderId, clientId }, (data) => {
          console.log('OnNFTOrderChanged==listen', data);
          if (!data) return;
          const status = data.status;
          // TODO
          switch (status) {
            case OrderStatusEnum.Initialized:
            case OrderStatusEnum.Created:
            case OrderStatusEnum.Pending:
            case OrderStatusEnum.StartTransfer:
              break;
            case OrderStatusEnum.Finish:
              onFinish?.({
                status: 'success',
                data: {
                  orderId,
                  nftSymbol: orderInfo?.nftOrderSection.nftSymbol,
                  collectionName: orderInfo?.nftOrderSection.sectionName,
                },
              });
              setOrderStatus(NFTCheckoutStatus.Finish);
              break;
            case OrderStatusEnum.TransferFailed:
            case OrderStatusEnum.Failed:
              setOrderStatus(NFTCheckoutStatus.Failed);
              break;
          }
        });
      } catch (error) {
        throw new Error('Get order status error');
      }
    },
    [onFinish, orderInfo],
  );

  const eventHandler = useCallback(
    (event: {
      data: {
        type: string;
        target: string;
        data: {
          orderId: string;
          transDirect: NFTTransDirectEnum.NFT_SELL;
        };
      };
    }) => {
      console.log(event, 'eventHandler');
      const detail = event.data;
      if (detail.target === '@portkey/ui-did-react:ACH_NFT_CHECKOUT') {
        switch (detail.type) {
          case 'PortkeyAchNFTCheckoutOnSuccess':
            console.log(detail, 'PortkeyAchNFTCheckoutOnSuccess');
            if (detail.data?.orderId != orderId) return;
            orderStatusHandler(detail.data.orderId);
            window.removeEventListener('message', eventHandler);
            break;
        }
      }
    },
    [orderId, orderStatusHandler],
  );

  const iframeLoad = useCallback(async () => {
    window.addEventListener('message', eventHandler);

    await sleep(2000);
  }, [eventHandler]);

  return (
    <div className={`portkey-ui-flex-column-center ${preFixCls}-wrapper`}>
      {orderStatus === NFTCheckoutStatus.Start && (
        <>
          <header>
            <span onClick={onCancel}>Close</span>
          </header>
          <section className={`${preFixCls}-inner`}>
            {iframeUrl && <iframe style={{ width: '100%', border: '0' }} onLoad={iframeLoad} src={iframeUrl} />}
            {!iframeUrl && (
              <div className="portkey-ui-flex-center loading-wrapper">
                <LoadingIndicator />
              </div>
            )}
          </section>
        </>
      )}
      {orderStatus === NFTCheckoutStatus.Failed && (
        <section className={`${preFixCls}-inner ${preFixCls}-result-inner`}>
          <ResultInner
            orderInfo={orderInfo}
            socialMedia={socialMedia}
            onClose={() => {
              onFinish?.({
                status: 'fail',
                data: {
                  orderId,
                  nftSymbol: orderInfo?.nftOrderSection.nftSymbol,
                  collectionName: orderInfo?.nftOrderSection.sectionName,
                },
              });
            }}
          />
        </section>
      )}
    </div>
  );
}
