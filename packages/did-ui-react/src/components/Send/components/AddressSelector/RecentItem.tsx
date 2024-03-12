import { RecentContactItemType } from '@portkey/services';
import { IClickAddressProps } from '../../../types/assets';
import clsx from 'clsx';
import { formatStr2EllipsisStr } from '../../../../utils';
import { transNetworkText } from '../../../../utils/converter';

export default function RecentItem({
  item,
  isMainnet,
  onClick,
}: {
  item: RecentContactItemType;
  isMainnet: boolean;
  onClick: (account: IClickAddressProps) => void;
}) {
  // const navigate = useNavigate();

  // const goRecentDetail = (
  //   chainId: ChainId,
  //   targetAddress: string,
  //   targetChainId: ChainId,
  //   name: string,
  //   index: string,
  // ) => {
  // };

  return (
    <div className={clsx(['flex-between-center', 'recent-item'])}>
      <div
        className="main-info"
        onClick={() => {
          onClick({ ...item, isDisable: false });
        }}>
        <p className="address">{`ELF_${formatStr2EllipsisStr(item.address, [6, 6])}_${item.addressChainId}`}</p>
        <p className="network">{transNetworkText(item.addressChainId, isMainnet)}</p>
      </div>

      {/* <div
        className="go-detail"
        onClick={() => goRecentDetail(item.chainId, item.address, item.addressChainId, item.name, item?.index)}>
        <CustomSvg className="go-detail-icon" type={'Info'} />
      </div> */}
    </div>
  );
}
