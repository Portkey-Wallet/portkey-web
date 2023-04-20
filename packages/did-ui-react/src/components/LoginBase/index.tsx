import LoginBaseCom, { LoginBaseProps } from './index.component';
import { BaseConfigProvider } from '../config-provider';

export default function LoginBase(props?: LoginBaseProps) {
  return (
    <BaseConfigProvider>
      <LoginBaseCom {...props} />
    </BaseConfigProvider>
  );
}
