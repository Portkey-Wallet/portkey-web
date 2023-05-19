import BaseStyleProvider from '../BaseStyleProvider';
import SignUpBaseCom, { SignUpBaseProps } from './index.component';

export default function SignUpBase(props?: SignUpBaseProps) {
  return (
    <BaseStyleProvider>
      <SignUpBaseCom {...props} />
    </BaseStyleProvider>
  );
}
