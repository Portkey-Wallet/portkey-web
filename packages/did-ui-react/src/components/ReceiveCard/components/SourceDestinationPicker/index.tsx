import { ChainInfo, TReceiveFromNetworkItem } from '@portkey/services';
import { transNetworkText } from '../../../../utils/converter';
import './index.less';
import CustomSvg from '../../../CustomSvg';

export function SourceDestinationItem({
  title,
  icon,
  chainName,
  onClick,
}: {
  title?: string;
  icon: string;
  chainName: string;
  onClick: () => void;
}) {
  return (
    <div className="item_wrapper" onClick={onClick}>
      {title && <div className="title">{title}</div>}
      <div className="chain-wrapper">
        <div className="icon-and-name">
          <img src={icon} className="icon" />
          <div className="chain-name">{chainName}</div>
        </div>
        <CustomSvg type="ArrowDown" className="arrow-icon" />
      </div>
    </div>
  );
}

export default function SourceDestinationPicker({
  sourceChain,
  destinationChain,
  onSourceClick,
  onDestinationClick,
}: {
  sourceChain: TReceiveFromNetworkItem;
  destinationChain: ChainInfo;
  onSourceClick: () => void;
  onDestinationClick: () => void;
}) {
  return (
    <div className="portkey-ui-receive-source-destination-picker">
      <SourceDestinationItem
        title="Source"
        icon={sourceChain.imageUrl}
        chainName={sourceChain.name}
        onClick={onSourceClick}
      />
      <div className="divider" />
      <SourceDestinationItem
        title="Destination"
        icon={destinationChain.chainImageUrl || ''}
        chainName={transNetworkText(destinationChain.chainId)}
        onClick={onDestinationClick}
      />
    </div>
  );
}
