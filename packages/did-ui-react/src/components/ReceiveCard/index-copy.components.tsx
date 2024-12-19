import TitleWrapper from '../TitleWrapper';
import CustomSvg from '../CustomSvg';
import { ReactNode, useMemo } from 'react';
import clsx from 'clsx';
import { transNetworkText } from '../../utils/converter';
import PortkeyQRCode from '../PortkeyQRCode';
import { ChainId } from '@portkey/types';
import { QRCodeDataObjType, shrinkSendQrData } from '../../utils/qrCode';
import { NetworkType } from '../../types';
import { MAINNET } from '../../constants/network';
import Copy from '../Copy';
import { supplementAllAelfAddress } from '../../utils/aelf';
import TokenImageDisplay from '../TokenImageDisplay';
import './index.less';

export interface ReceiveCardProps {
  receiveInfo: QRCodeDataObjType['toInfo'];
  assetInfo: QRCodeDataObjType['assetInfo'];
  networkType: NetworkType;
  title?: ReactNode;
  closeIcon?: ReactNode;
  symbolIcon?: string;
  backIcon?: ReactNode;
  className?: string;
  chainId: ChainId;
  onBack?: () => void;
}
export default function ReceiveCardMain({
  receiveInfo,
  assetInfo,
  symbolIcon,
  networkType,
  chainId,
  backIcon,
  className,
  closeIcon,
  title,
  onBack,
}: ReceiveCardProps) {
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);
  const receiveAddress = useMemo(
    () => supplementAllAelfAddress(receiveInfo.address, 'ELF', chainId),
    [chainId, receiveInfo.address],
  );

  const value: QRCodeDataObjType = useMemo(
    () => ({
      type: 'send',
      sendType: 'token',
      networkType: networkType,
      chainType: 'aelf',
      toInfo: {
        name: receiveInfo.name,
        address: receiveAddress,
      },
      assetInfo,
    }),
    [assetInfo, networkType, receiveAddress, receiveInfo.name],
  );
  return (
    <div className={clsx('portkey-ui-receive-wrapper', className)}>
      <div className="portkey-ui-receive-content">
        <TitleWrapper
          className="portkey-ui-receive-header"
          leftElement={backIcon ? backIcon : <CustomSvg type="LeftArrow" onClick={onBack} />}
          title={title}
          rightElement={closeIcon}
        />
        <div className="portkey-ui-flex-column-center portkey-ui-receive-inner">
          <h2 className="portkey-ui-receive-title">My Wallet Address to Receive</h2>
          <div className="portkey-ui-flex-column-center token-info">
            <TokenImageDisplay width={24} symbol={assetInfo?.symbol?.[0]} src={symbolIcon} />
            <p className="symbol">{assetInfo?.label || assetInfo.symbol}</p>
            <p className="network">{transNetworkText(chainId, isMainnet)}</p>
          </div>
          <div className="scan-content">
            <PortkeyQRCode value={JSON.stringify(shrinkSendQrData(value))} />
          </div>
          <div className="receive-address">
            <div className="address">{receiveAddress}</div>
            <Copy toCopy={receiveAddress} />
          </div>
        </div>
      </div>
    </div>
  );
}
