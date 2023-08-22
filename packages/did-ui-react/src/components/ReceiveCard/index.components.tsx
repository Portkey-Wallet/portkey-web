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
import { ELF_SYMBOL } from '../../constants/assets';
import { getEntireDIDAelfAddress } from '../../utils/aelf';
import './index.less';

export interface ReceiveCardProps {
  receiveInfo: QRCodeDataObjType['toInfo'];
  assetInfo: QRCodeDataObjType['assetInfo'];
  networkType: NetworkType;
  title?: ReactNode;
  closeIcon?: ReactNode;
  backIcon?: ReactNode;
  className?: string;
  chainId: ChainId;
  onBack?: () => void;
}
export default function ReceiveCardMain({
  receiveInfo,
  assetInfo,
  networkType,
  chainId,
  backIcon,
  className,
  closeIcon,
  title,
  onBack,
}: ReceiveCardProps) {
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);

  const value: QRCodeDataObjType = useMemo(
    () => ({
      type: 'send',
      sendType: 'token',
      netWorkType: networkType,
      chainType: 'aelf',
      toInfo: {
        name: receiveInfo.name,
        address: getEntireDIDAelfAddress(receiveInfo.address, 'ELF', chainId),
      },
      assetInfo,
      address: getEntireDIDAelfAddress(receiveInfo.address, 'ELF', chainId),
    }),
    [assetInfo, chainId, networkType, receiveInfo],
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
            {assetInfo.symbol === ELF_SYMBOL ? (
              <CustomSvg type={'ELF'} />
            ) : (
              <div className="icon">{assetInfo?.symbol?.[0]}</div>
            )}
            <p className="symbol">{assetInfo.symbol}</p>
            <p className="network">{transNetworkText(chainId, isMainnet)}</p>
          </div>
          <div className="scan-content">
            <PortkeyQRCode value={JSON.stringify(shrinkSendQrData(value))} />
          </div>
          <div className="receive-address">
            <div className="address">{getEntireDIDAelfAddress(receiveInfo.address, 'ELF', chainId)}</div>
            <Copy toCopy={getEntireDIDAelfAddress(receiveInfo.address, 'ELF', chainId)} />
          </div>
        </div>
      </div>
    </div>
  );
}
