import { ChainId } from '@portkey/types';
import { ACH_NFT_CONFIG, NFTCheckoutByACH, NFTTransDirectEnum } from '../../constants/ramp';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import ACHCheckout, { IFinishResult } from './ACHCheckout';
import { Modal } from 'antd';
import { ISocialMedia } from '../types/social';
import './index.less';

export enum MerchantNameEnum {
  Alchemy = 'Alchemy',
}

export interface NFTCheckoutProps {
  type?: `${NFTCheckoutByACH}`;
  orderId: string;
  originChainId: ChainId;
  appId?: string;
  callbackUrl?: string;
  rampWebUrl?: string;
  targetFiat?: string;
  transDirect?: `${NFTTransDirectEnum}`;
  socialMedia?: ISocialMedia[];
  className?: string;
  wrapClassName?: string;
  merchantName?: `${MerchantNameEnum}`;
}

export default async function NFTCheckout({
  type = NFTCheckoutByACH.MARKET,
  appId = ACH_NFT_CONFIG['MAINNET'].appId,
  orderId,
  originChainId,
  targetFiat = 'USD',
  socialMedia,
  transDirect = NFTTransDirectEnum.NFT_SELL,
  rampWebUrl = ACH_NFT_CONFIG['MAINNET'].baseUrl,
  className = '',
  merchantName = MerchantNameEnum.Alchemy,
  wrapClassName = '',
}: NFTCheckoutProps): Promise<IFinishResult> {
  return new Promise((resolve, reject) => {
    const modal = Modal.confirm({
      width: 550,
      centered: true,
      icon: null,
      maskClosable: true,
      className: 'portkey-ui-nft-checkout-modal ' + className,
      wrapClassName: 'portkey-ui-wrapper portkey-ui-modal-method-wrapper ' + wrapClassName,
      content: (
        <PortkeyStyleProvider>
          {merchantName === 'Alchemy' && (
            <ACHCheckout
              type={type}
              transDirect={transDirect}
              rampWebUrl={rampWebUrl}
              appId={appId}
              orderId={orderId}
              targetFiat={targetFiat}
              originChainId={originChainId}
              socialMedia={socialMedia}
              onCancel={() => {
                modal.destroy();
                reject(Error('Cancel'));
              }}
              onFinish={(result) => {
                modal.destroy();
                resolve(result);
              }}
            />
          )}
        </PortkeyStyleProvider>
      ),
    });
  });
}
