import BaseStyleProvider from '../BaseStyleProvider';
import CodeVerifyCom, { CodeVerifyProps } from './index.component';

export default function CodeVerify(props: CodeVerifyProps) {
  return (
    <BaseStyleProvider>
      <CodeVerifyCom {...props} />
    </BaseStyleProvider>
  );
}
