import VerifierSelectCom, { VerifierSelectProps } from './index.component';
import { BaseConfigProvider } from '../config-provider';

export default function VerifierSelect(props: VerifierSelectProps) {
  return (
    <BaseConfigProvider>
      <VerifierSelectCom {...props} />
    </BaseConfigProvider>
  );
}
