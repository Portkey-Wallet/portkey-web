import PortkeyStyleProvider from '../PortkeyStyleProvider';
import SignUpBaseCom, { SignUpBaseProps } from './index.component';

export default function SignUpBase(props: SignUpBaseProps) {
  return (
    <PortkeyStyleProvider>
      <SignUpBaseCom {...props} />
    </PortkeyStyleProvider>
  );
}
