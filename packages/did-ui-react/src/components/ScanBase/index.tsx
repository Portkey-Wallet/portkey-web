import clsx from 'clsx';
import PortkeyQRCode from '../PortkeyQRCode';
import './index.less';
import ScanLoading from './components/ScanLoading';
import { GridType } from '../types';
import CustomSvg from '../CustomSvg';
import BackHeader from '../BackHeader';

interface ScanCardProps {
  isShowIcon?: boolean;
  gridType?: GridType;
  isMobile?: boolean;
  isWaitingAuth?: boolean;
  qrData?: string; // JSON.stringify(LoginQRData)
  backIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  wrapperClassName?: string;
  onBack?: () => void;
  onClose?: () => void;
}
export default function ScanBase({
  qrData,
  backIcon,
  rightElement,
  isMobile,
  isWaitingAuth = false,
  wrapperClassName,
  onBack,
  onClose,
}: ScanCardProps) {
  console.log('onBack is', onBack);
  return (
    <div
      className={clsx(
        'portkey-ui-flex-column',
        'scan-card-wrapper',
        isMobile && 'scan-card-mobile-wrapper',
        wrapperClassName,
      )}>
      <div className={clsx('scan-text-inner')}>
        <BackHeader
          leftElement={undefined}
          onBack={onBack}
          rightElement={
            rightElement ? (
              rightElement
            ) : (
              <CustomSvg
                type="X"
                onClick={onClose}
                fillColor="black"
                style={{
                  width: 20,
                  height: 20,
                  cursor: 'pointer',
                }}
              />
            )
          }
        />
        <h2 className={clsx('font-medium scan-title')}>Log in with QR code</h2>
        <p className="description">Please use the portkey Dapp to scan the QR code</p>
      </div>

      <div className="scan-card-content">
        <div className="scan-content">{qrData && qrData !== '{}' && <PortkeyQRCode value={qrData} />}</div>
        {isWaitingAuth && (
          <div className="portkey-ui-flex-center waiting-wrapper">
            <ScanLoading />
            <p className="waiting-text">Waiting for authorization...</p>
          </div>
        )}
      </div>
    </div>
  );
}
