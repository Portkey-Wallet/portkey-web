import PortkeyStyleProvider from '../PortkeyStyleProvider';
import PaymentSecurityMain, { IPaymentSecurityProps } from './index.components';

export default function PaymentSecurity(props: IPaymentSecurityProps) {
  return (
    <PortkeyStyleProvider>
      <PaymentSecurityMain {...props} />
    </PortkeyStyleProvider>
  );
}
