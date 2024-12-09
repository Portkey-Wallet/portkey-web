import { QRCode, IProps } from 'react-qrcode-logo';
import PortkeyQR from './PortkeyQR.svg';
import './index.less';

export default function PortkeyQRCode({ value, ...props }: IProps) {
  return (
    <QRCode
      id="portkey-qr-code"
      value={value}
      size={400}
      quietZone={0}
      logoImage={PortkeyQR}
      logoWidth={64}
      logoHeight={64}
      qrStyle={'dots'}
      eyeRadius={{ outer: 27, inner: 14 }}
      ecLevel={'L'}
      {...props}
    />
  );
}
