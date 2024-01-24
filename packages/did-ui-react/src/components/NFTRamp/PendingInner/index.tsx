import { AchNFTOrderInfo } from '@portkey/services';
import CustomSvg from '../../CustomSvg';
import './index.less';
import { showMax15Chars } from '../utils';
import ThrottleButton from '../../ThrottleButton';

const preFixCls = 'portkey-ui-checkout-pending-inner';

interface PendingInnerProps {
  onClose?: () => void;
  orderInfo?: AchNFTOrderInfo;
}

export default function PendingInner({ orderInfo, onClose }: PendingInnerProps) {
  return (
    <div className={`${preFixCls}-wrapper`}>
      <header className={`portkey-ui-flex-between ${preFixCls}-header`}>
        <span />
        <CustomSvg type="Close2" onClick={onClose} />
      </header>
      <div className={`${preFixCls}-content`}>
        <div className={`portkey-ui-flex-column-center portkey-ui-justify-center ${preFixCls}-nft`}>
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

        <div className={`portkey-ui-flex ${preFixCls}-waiting-tip`}>
          <CustomSvg type="Timer" />
          <div className={`portkey-ui-flex-1 ${preFixCls}-tip`}>
            Please wait for transaction confirmation. The NFT will appear in your wallet within 1-2 minutes.
          </div>
        </div>
      </div>

      <div className="portkey-ui-btn-wrapper">
        <ThrottleButton type="primary" onClick={onClose}>
          Close
        </ThrottleButton>
      </div>
    </div>
  );
}
