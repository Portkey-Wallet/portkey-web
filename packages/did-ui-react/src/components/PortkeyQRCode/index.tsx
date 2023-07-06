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
      logoWidth={80}
      logoHeight={80}
      qrStyle={'squares'}
      eyeRadius={{ outer: 7, inner: 4 }}
      ecLevel={'L'}
      {...props}
    />
  );
}
