import CodeVerifyCom, { CodeVerifyProps } from './index.component';
import { BaseConfigProvider } from '../config-provider';

export default function CodeVerify(props: CodeVerifyProps) {
  return (
    <BaseConfigProvider>
      <CodeVerifyCom {...props} />
    </BaseConfigProvider>
  );
}
