import { ISocialMedia, SocialMediaItemType } from '../../types/social';
import { Button } from 'antd';
import { AchNFTOrderInfo } from '@portkey/services';
import './index.less';
import CustomSvg from '../../CustomSvg';
import { showMax15Chars } from '../utils';

const preFixCls = 'portkey-ui-ach-checkout-result';

interface ResultInnerProps {
  socialMedia?: ISocialMedia[];
  orderInfo?: AchNFTOrderInfo;
  onClose?: () => void;
}

export default function ResultInner({ socialMedia, orderInfo, onClose }: ResultInnerProps) {
  console.log(socialMedia, 'socialMedia==');
  return (
    <div className={`portkey-ui-flex-column ${preFixCls}`}>
      <div className={`portkey-ui-flex-between-center ${preFixCls}-title`}>
        <span>Purchase Failed</span>
        <CustomSvg type="Close2" onClick={onClose} />
      </div>

      <div className={`${preFixCls}-order`}>
        <div className={`portkey-ui-flex ${preFixCls}-nft`}>
          <div className={`${preFixCls}-nft-picture-wrapper`}>
            <img className={`${preFixCls}-nft-picture`} src={orderInfo?.nftOrderSection.nftPicture} />
          </div>
          <div className={`${preFixCls}-nft-item`}>
            <div className="collection-name">
              {showMax15Chars(orderInfo?.nftOrderSection.nftCollectionName) || '--'}
            </div>
            <div className="nft-name">{showMax15Chars(orderInfo?.nftOrderSection.nftSymbol) || '--'}</div>
          </div>
        </div>
        <div className={`portkey-ui-flex-between-center ${preFixCls}-order-id-wrapper`}>
          <span className={`${preFixCls}-order-id-text`}>Your order number:</span>
          <span className={`${preFixCls}-order-id`}>{orderInfo?.id || '--'}</span>
        </div>
      </div>
      <div className={`portkey-ui-flex-center ${preFixCls}-social`}>
        {socialMedia && (
          <div>
            <div className={`${preFixCls}-social-description`}>Please contact us for a refund</div>
            <div className={`portkey-ui-flex-center ${preFixCls}-social-media`}>
              {socialMedia.map((item) => (
                <a
                  href={`${item.type === SocialMediaItemType.email ? 'mailto: ' : ''}${item.link}`}
                  key={item.link}
                  target="_blank"
                  rel="noreferrer">
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className={`portkey-ui-btn-wrapper ${preFixCls}-footer`}>
        <Button type="primary" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
