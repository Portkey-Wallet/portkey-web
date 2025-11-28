import PortkeyStyleProvider from '../PortkeyStyleProvider';
import LoginBaseCom, { LoginBaseProps } from './index.component';

export default function LoginBase(props: LoginBaseProps) {
  return (
    <PortkeyStyleProvider>
      <LoginBaseCom {...props} />
    </PortkeyStyleProvider>
  );
}
