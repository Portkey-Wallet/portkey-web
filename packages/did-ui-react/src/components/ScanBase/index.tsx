import clsx from 'clsx';
import PortkeyQRCode from '../PortkeyQRCode';
import './index.less';
import ScanLoading from './components/ScanLoading';

interface ScanCardProps {
  isShowIcon?: boolean;
  isWaitingAuth?: boolean;
  qrData?: string; // JSON.stringify(LoginQRData)
  backIcon?: React.ReactNode;
  wrapperClassName?: string;
  onBack?: () => void;
}

export default function ScanCard({
  qrData,
  backIcon,
  isWaitingAuth = false,
  isShowIcon = true,
  wrapperClassName,
  onBack,
}: ScanCardProps) {
  return (
    <div className={clsx('scan-card-wrapper', wrapperClassName)}>
      <h2 className="font-medium scan-title">
        Scan code to log in
        {isShowIcon && backIcon && (
          <div className="back-icon-wrapper" onClick={onBack}>
            {backIcon}
          </div>
        )}
      </h2>
      <div className="scan-card-content">
        <p className="description">Please use the portkey Dapp to scan the QR code</p>
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
