import { IClickAddressProps } from '../../../types/assets';
import clsx from 'clsx';
import { formatStr2EllipsisStr } from '../../../../utils';
import { transNetworkTextV2 } from '../../../../utils/converter';
import ImgWithCornerMark from '../../../ImgWithCornerMark';
import { IRecentItem } from '../../../../utils/recent';

export default function RecentItem({
  item,
  isMainnet,
  onClick,
}: {
  item: IRecentItem;
  isMainnet: boolean;
  onClick: (account: IClickAddressProps) => void;
}) {
  return (
    <div
      className={clsx(['portkey-ui-flex-between-center', 'recent-item'])}
      onClick={() => onClick(item as IClickAddressProps)}>
      <div className="left-section">
        <ImgWithCornerMark mainImgTitle={item.address} cornerImgSrc={item.networkIcon || ''} />
      </div>
      <div className="center-section">
        <div className="address">{formatStr2EllipsisStr(item.address, [8, 8])}</div>
        <div className="chain-info">
          {transNetworkTextV2({
            chainId: item.chainId,
            isMainnet,
            chainType: item.network,
            networkName: item.network,
          })}
        </div>
      </div>
      {/* TODO: jump to detail */}
      {/* <div className="go-detail">
        <CustomSvg className="go-detail-icon" type={'Info'} />
      </div> */}
    </div>
  );
}
