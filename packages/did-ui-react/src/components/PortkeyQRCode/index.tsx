import { QRCode, IProps } from 'react-qrcode-logo';
import PortkeyQR from './PortkeyQR.svg';

export default function PortkeyQRCode({ value, ...props }: IProps) {
  return (
    <QRCode
      value={value}
      size={200}
      quietZone={0}
      logoImage={PortkeyQR}
      logoWidth={40}
      logoHeight={40}
      qrStyle={'squares'}
      eyeRadius={{ outer: 7, inner: 4 }}
      ecLevel={'L'}
      {...props}
    />
  );
}
