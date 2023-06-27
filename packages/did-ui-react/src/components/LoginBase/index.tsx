import BaseStyleProvider from '../BaseStyleProvider';
import LoginBaseCom, { LoginBaseProps } from './index.component';

export default function LoginBase(props?: LoginBaseProps) {
  return (
    <BaseStyleProvider>
      <LoginBaseCom {...props} />
    </BaseStyleProvider>
  );
}
