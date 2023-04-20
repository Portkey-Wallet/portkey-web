import clsx from 'clsx';
import PortkeyQRCode from '../PortkeyQRCode';
import './index.less';

interface ScanCardProps {
  isShowIcon?: boolean;
  qrData?: string; // JSON.stringify(LoginQRData)
  backIcon?: React.ReactNode;
  wrapperClassName?: string;
  onBack?: () => void;
}

export default function ScanCard({ qrData, backIcon, isShowIcon = true, wrapperClassName, onBack }: ScanCardProps) {
  return (
    <div className={clsx('scan-card-wrapper', wrapperClassName)}>
      <h2 className="scan-title">
        Scan code to log in
        {isShowIcon && backIcon && (
          <div className="back-icon-wrapper" onClick={onBack}>
            {backIcon}
          </div>
        )}
      </h2>
      <div className="scan-card-content">
        <p className="description">Please use the portkey Dapp to scan the QR code</p>
        <div className="scan-content">{qrData && <PortkeyQRCode value={qrData} />}</div>
      </div>
    </div>
  );
}
