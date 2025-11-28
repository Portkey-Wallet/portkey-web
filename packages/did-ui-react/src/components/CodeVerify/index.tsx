import PortkeyStyleProvider from '../PortkeyStyleProvider';
import CodeVerifyCom, { CodeVerifyProps } from './index.component';

export default function CodeVerify(props: CodeVerifyProps) {
  return (
    <PortkeyStyleProvider>
      <CodeVerifyCom {...props} />
    </PortkeyStyleProvider>
  );
}
