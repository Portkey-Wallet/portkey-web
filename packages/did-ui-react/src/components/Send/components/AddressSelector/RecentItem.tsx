import { IClickAddressProps } from '../../../types/assets';
import clsx from 'clsx';
import { formatStr2EllipsisStr } from '../../../../utils';
import { transNetworkTextV2 } from '../../../../utils/converter';
import ImgWithCornerMark from '../../../ImgWithCornerMark';
import { IRecentItem } from '../../../../utils/recent';

export default function RecentItem({
  item,
  isMainnet,
}: {
  item: IRecentItem;
  isMainnet: boolean;
  onClick: (account: IClickAddressProps) => void;
}) {
  return (
    <div className={clsx(['portkey-ui-flex-between-center', 'recent-item'])}>
      <div className="left-section">
        <ImgWithCornerMark imgSrc={''} cornerImgSrc={''} />
      </div>
      <div className="center-section">
        <div className="address">{formatStr2EllipsisStr(item.address, [8, 8])}</div>
        <div className="chain-info">
          {transNetworkTextV2({
            chainId: item.chainId,
            isMainnet,
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
