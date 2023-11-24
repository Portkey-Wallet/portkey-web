import { RecentContactItemType } from '@portkey/services';
import { IClickAddressProps } from '../../../types/assets';
import ContactCard from './ContactCard';
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

  return item?.name ? (
    <ContactCard
      isMainnet={isMainnet}
      user={item}
      onChange={onClick}
      className="portkey-ui-contact-card-in-recent"
      // chainId={item.chainId}
    />
  ) : (
    // In order to keep the format of Recents and Contacts consistent, this can use like {item.addresses[0]}
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
