import BaseStyleProvider from '../BaseStyleProvider';
import SignUpAndLoginCom, { SignUpAndLoginProps } from './index.component';

export default function SignUpAndLogin(props?: SignUpAndLoginProps) {
  return (
    <BaseStyleProvider>
      <SignUpAndLoginCom {...props} />
    </BaseStyleProvider>
  );
}
