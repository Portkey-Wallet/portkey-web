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
  wrapperClassName?: string;
  onBack?: () => void;
  onClose?: () => void;
}
/*
<BackHeader
              leftElement={step === STEP.enterPin ? false : undefined}
              onBack={() => {
                if (step === STEP.confirmPin) {
                  setPin('');
                  setError('');
                  setConfirmPin('');
                  setStep(STEP.enterPin);
                } else {
                  onCancel?.();
                }
              }}
              title={
                step === STEP.enterPin ? (
                  <div className="set-pin-title">{t('Create a PIN to protect your wallet')}</div>
                ) : null
              }
              rightElement={
                <CustomSvg
                  type="X"
                  onClick={onCancel}
                  fillColor="black"
                  style={{
                    width: 20,
                    height: 20,
                  }}
                />
              }
            />
*/
export default function ScanBase({
  qrData,
  backIcon,
  gridType = GridType.qrCodeOnTop,
  isMobile,
  isWaitingAuth = false,
  isShowIcon = true,
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
          }
        />
        <h2 className={clsx('font-medium scan-title')}>
          {/* {gridType === GridType.qrCodeOnTop && isMobile && (
            <CustomSvg type="Portkey" style={{ width: '56px', height: '56px' }} />
          )} */}
          Log in with QR code
          {/* {isShowIcon && backIcon && (
            <div className="back-icon-wrapper" onClick={onBack}>
              {backIcon}
            </div>
          )} */}
        </h2>
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
