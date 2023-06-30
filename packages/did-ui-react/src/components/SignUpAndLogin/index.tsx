import PortkeyStyleProvider from '../PortkeyStyleProvider';
import SignUpAndLoginCom, { SignUpAndLoginProps } from './index.component';

export default function SignUpAndLogin(props?: SignUpAndLoginProps) {
  return (
    <PortkeyStyleProvider>
      <SignUpAndLoginCom {...props} />
    </PortkeyStyleProvider>
  );
}
