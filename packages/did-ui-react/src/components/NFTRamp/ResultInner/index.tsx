import { ISocialMedia } from '../../types/social';
import { Button } from 'antd';
import { AchNFTOrderInfo } from '@portkey/services';
import './index.less';

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
      <div className={`${preFixCls}-title`}>Your purchase failed!</div>
      <div className={`${preFixCls}-order`}>
        <div className={`portkey-ui-flex ${preFixCls}-nft`}>
          <div className={`${preFixCls}-nft-picture-wrapper`}>
            <img className={`${preFixCls}-nft-picture`} src={orderInfo?.nftOrderSection.nftPicture} />
          </div>
          <div className={`${preFixCls}-nft-item`}>
            <div className="collection-name">{orderInfo?.nftOrderSection.sectionName || '--'}</div>
            <div className="nft-name">{orderInfo?.nftOrderSection.nftSymbol || '--'}</div>
          </div>
        </div>
        <div className={`portkey-ui-flex-between-center ${preFixCls}-order-id-wrapper`}>
          <span className={`${preFixCls}-order-id-text`}>Your Order No.</span>
          <span className={`${preFixCls}-order-id`}>{orderInfo?.id || '--'}</span>
        </div>
      </div>
      <div className={`portkey-ui-flex-center ${preFixCls}-social`}>
        {socialMedia && (
          <div>
            <div className={`${preFixCls}-social-description`}>Please contact us for a refund</div>
            <div className={`portkey-ui-flex-center ${preFixCls}-social-media`}>
              {socialMedia.map((item) => (
                <a href={item.link} key={item.link}>
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
