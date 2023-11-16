import { ACH_NFT_CONFIG, NFTCheckoutByACH, NFTTransDirectEnum } from '../../constants/ramp';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import ACHCheckout from './ACHCheckout';
import { INFTCheckout, MerchantNameEnum } from './types';
import BaseModalFunc from '../ModalMethod/BaseModalMethod';
import './index.less';

/**
 *
 * @param merchantName - When merchantName is Alchemy you can configure achWebUrl [Alchemy webpage]
 * @returns INFTCheckoutFinishResult
 */
const NFTCheckout: INFTCheckout['nftCheckout'] = async ({
  type = NFTCheckoutByACH.MARKET,
  appId = ACH_NFT_CONFIG['MAINNET'].appId,
  orderId,
  originChainId,
  targetFiat = 'SGD',
  socialMedia,
  transDirect = NFTTransDirectEnum.NFT_SELL,
  achWebUrl = ACH_NFT_CONFIG['MAINNET'].baseUrl,
  className = '',
  merchantName = MerchantNameEnum.Alchemy,
  wrapClassName = '',
  language,
}) => {
  return new Promise((resolve, reject) => {
    const modal = BaseModalFunc({
      width: 550,
      maskClosable: true,
      className: 'portkey-ui-nft-checkout-modal ' + className,
      wrapClassName,
      content: (
        <PortkeyStyleProvider>
          {merchantName === 'Alchemy' && (
            <ACHCheckout
              type={type}
              transDirect={transDirect}
              achWebUrl={achWebUrl}
              appId={appId}
              orderId={orderId}
              targetFiat={targetFiat}
              originChainId={originChainId}
              socialMedia={socialMedia}
              language={language}
              onFinish={(result) => {
                modal.destroy();
                resolve(result);
              }}
              onError={(e) => {
                modal.destroy();
                reject(e);
              }}
            />
          )}
        </PortkeyStyleProvider>
      ),
    });
  });
};

export default NFTCheckout;
