import SignUpBaseCom, { SignUpBaseProps } from './index.component';
import { BaseConfigProvider } from '../config-provider';

export default function SignUpBase(props?: SignUpBaseProps) {
  return (
    <BaseConfigProvider>
      <SignUpBaseCom {...props} />
    </BaseConfigProvider>
  );
}
