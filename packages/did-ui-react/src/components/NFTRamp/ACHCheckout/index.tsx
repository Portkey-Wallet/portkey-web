import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { did, handleErrorMessage, isValidEmail, randomId } from '../../../utils';
import { message } from 'antd';
import { ErrorInfo } from '../../../types';
import { AccountTypeEnum, AchNFTOrderInfo, GetAchNFTSignatureParams } from '@portkey-v1/services';
import { stringifyUrl } from 'query-string';
import { signalrSell, OrderStatusEnum } from '@portkey-v1/socket';
import { getServiceUrl, getSocketUrl } from '../../config-provider/utils';
import { DAY, WEB_PAGE } from '../../../constants';
import { ChainId } from '@portkey-v1/types';
import LoadingIndicator from '../../Loading';
import { NFTCheckoutByACH, NFTTransDirectEnum, OUR_PRODUCT_NAME } from '../../../constants/ramp';
import ResultInner from '../ResultInner';
import { ISocialMedia } from '../../types/social';
import { SOCIAL_MEDIA } from '../../../constants/media';
import { INFTCheckoutFinishResult } from '../types';
import CustomSvg from '../../CustomSvg';
import PendingInner from '../PendingInner';
import './index.less';

const preFixCls = 'portkey-ui-ach-checkout';

interface ACHCheckoutProps {
  appId: string;
  type?: `${NFTCheckoutByACH}`;
  orderId: string;
  targetFiat?: string;
  transDirect?: `${NFTTransDirectEnum}`;
  achWebUrl: string;
  originChainId: ChainId;
  language?: string;
  socialMedia?: ISocialMedia[];
  onError?: (error: ErrorInfo<Error>) => void;
  onFinish?: (result: INFTCheckoutFinishResult) => void;
}

export enum NFTCheckoutStatus {
  Failed,
  Start,
  Pending,
  Transferred,
  Finish,
}

export default function ACHCheckout({
  appId,
  orderId,
  achWebUrl,
  originChainId,
  targetFiat = 'SGD',
  language = 'en-US',
  type = NFTCheckoutByACH.MARKET,
  transDirect = NFTTransDirectEnum.NFT_SELL,
  socialMedia = SOCIAL_MEDIA,
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

  const callbackUrl = useMemo(() => `${getServiceUrl()}/api/app/thirdPart/nftorder/alchemy`, []);

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

  const orderStatusHandler = useCallback(
    async (orderId: string) => {
      try {
        const clientId = randomId();

        await signalrSell.doOpen({
          url: getSocketUrl(),
          clientId,
        });

        signalrSell.OnNFTOrderChanged({ orderId, clientId }, (data) => {
          console.log('OnNFTOrderChanged==listen', data);
          if (!data) return;
          const status = data.status;
          console.log('OnNFTOrderChanged status:', status);

          switch (status) {
            case OrderStatusEnum.Initialized:
            case OrderStatusEnum.Created:
            case OrderStatusEnum.Pending:
            case OrderStatusEnum.StartTransfer:
            case OrderStatusEnum.Transferring:
              setOrderStatus(NFTCheckoutStatus.Start);
              break;
            case OrderStatusEnum.Transferred: //
            case OrderStatusEnum.TransferFailed: // retry
              setOrderStatus(NFTCheckoutStatus.Transferred);
              break;
            case OrderStatusEnum.Finish:
              signalrSell.destroy();
              onFinish?.({
                status: 'success',
                data: {
                  orderId,
                },
              });
              setOrderStatus(NFTCheckoutStatus.Finish);
              break;
            case OrderStatusEnum.Failed:
              signalrSell.destroy();
              setOrderStatus(NFTCheckoutStatus.Failed);
              break;
          }
        });

        await signalrSell.requestNFTOrderStatus(clientId, orderId);
      } catch (error) {
        throw new Error('Get order status error');
      }
    },
    [onFinish],
  );

  const checkOrderStatus = useCallback((status: OrderStatusEnum) => {
    switch (status) {
      case OrderStatusEnum.Pending:
      case OrderStatusEnum.StartTransfer:
      case OrderStatusEnum.Transferring:
      case OrderStatusEnum.Transferred: //
      case OrderStatusEnum.TransferFailed: // retry
        return 'Pending';
      case OrderStatusEnum.Finish:
        return 'Finish';
      case OrderStatusEnum.Failed:
        return 'Failed';
      case OrderStatusEnum.Initialized:
      case OrderStatusEnum.Created:
      default:
        return 'Initialized';
    }
  }, []);

  const initParams = useCallback(async () => {
    try {
      const orderInfo = await getOrderInfo();
      if (!orderInfo) throw Error('Please check your orderId');
      const orderStatus = checkOrderStatus(orderInfo.status as OrderStatusEnum);
      if (orderStatus === 'Failed') throw Error('The current order status is failed');
      if (orderStatus === 'Finish') throw Error('The current order has been completed');
      if (orderStatus === 'Pending') {
        setOrderStatus(NFTCheckoutStatus.Transferred);
        orderStatusHandler(orderInfo.id);
        return;
      }
      console.log(orderInfo, 'orderInfo===');
      const redirectUrl = `${WEB_PAGE}/ach-nft-checkout-callback?transDirect=${transDirect}&orderId=${orderInfo.id}`;
      redirectRef.current = redirectUrl;
      // params: https://alchemypay.readme.io/docs/create-order-1
      const getSignatureParams: GetAchNFTSignatureParams = {
        appId,
        language,
        timestamp: orderInfo.nftOrderSection?.createTime || Math.floor(Date.now()).toString(),
        timeout: orderInfo.nftOrderSection?.expireTime || Math.floor(Date.now() + DAY).toString(), // time going to expire, UTC,13 digit
        crypto: orderInfo.crypto, // ELF/ETH.etc ELF default. Required parameter for crypto-based
        cryptoAmount: orderInfo.cryptoAmount, // Total NFT oder crypto amount，Required parameter for crypto-based
        network: orderInfo.network || 'ELF', // Parameter for crypto-based Real-time settlement
        targetFiat,
        type,
        uniqueId: orderInfo.id, // NFT Unique Identity, Required for NFT type MARKET 🔺
        name: orderInfo.nftOrderSection?.nftSymbol, // NFT name
        picture: orderInfo.nftOrderSection?.nftPicture, // NFT pic rendering URL, 220px * 220 px
        redirectUrl: redirectUrl, // Redirect URL after buying NFT succeed
        callbackUrl: callbackUrl, // Webhook URL to get the notify message from Alchemy Pay
        merchantOrderNo: orderInfo.id, // Merchant defined order ID
        merchantName: OUR_PRODUCT_NAME, // orderInfo.nftOrderSection?.merchantName || 'Alchemy', // Merchant name
      };
      // quantity: orderInfo?.cryptoQuantity || '1', // NFT quantity, Required for NFT type MINT 🔺
      if (type === 'MINT') getSignatureParams.quantity = orderInfo?.cryptoQuantity || '1';
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
      console.log(query, 'query===');
      const url = stringifyUrl(
        {
          url: achWebUrl,
          query,
        },
        { encode: true },
      );

      setIframeUrl(url);
    } catch (error) {
      message.error(handleErrorMessage(error));
      onError?.({
        errorFields: 'ACH NFT checkout init params',
        error: Error(handleErrorMessage(error)),
      });
    }
  }, [
    getOrderInfo,
    checkOrderStatus,
    transDirect,
    appId,
    language,
    targetFiat,
    type,
    callbackUrl,
    getSignature,
    getACHToken,
    achWebUrl,
    orderStatusHandler,
    onError,
  ]);

  useEffect(() => {
    initParams();
  }, [initParams]);

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
      if (detail.target === '@portkey-v1/ui-did-react:ACH_NFT_CHECKOUT') {
        switch (detail.type) {
          case 'PortkeyAchNFTCheckoutOnSuccess':
            console.log(detail, 'PortkeyAchNFTCheckoutOnSuccess');
            if (detail.data?.orderId != orderId) return;
            // Establish a websocket connection and monitor order status
            orderStatusHandler(detail.data.orderId);
            window.removeEventListener('message', eventHandler);
            break;
        }
      }
    },
    [orderId, orderStatusHandler],
  );

  const iframeLoad = useCallback(async () => {
    // Monitor alchemy pay finish callback
    window.addEventListener('message', eventHandler);
  }, [eventHandler]);

  return (
    <div className={`portkey-ui-flex-column-center ${preFixCls}-wrapper`}>
      {orderStatus === NFTCheckoutStatus.Start && (
        <>
          <header className={`portkey-ui-flex-between-center ${preFixCls}-header`}>
            <span className="header-title">Checkout with Alchemy Pay</span>
            <CustomSvg
              type="Close2"
              onClick={() => {
                onFinish?.({
                  status: 'cancel',
                  data: {
                    orderId,
                  },
                });
              }}
            />
          </header>
          <section className={`${preFixCls}-inner`}>
            {iframeUrl && <iframe style={{ width: '100%' }} onLoad={iframeLoad} src={iframeUrl} />}
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
                },
              });
            }}
          />
        </section>
      )}

      {(orderStatus === NFTCheckoutStatus.Transferred || orderStatus === NFTCheckoutStatus.Pending) && (
        <PendingInner
          orderInfo={orderInfo}
          onClose={() => {
            onFinish?.({
              status: 'pending',
              data: {
                orderId,
              },
            });
          }}
        />
      )}
    </div>
  );
}
