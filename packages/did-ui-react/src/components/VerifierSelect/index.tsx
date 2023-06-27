import BaseStyleProvider from '../BaseStyleProvider';
import VerifierSelectCom, { VerifierSelectProps } from './index.component';

export default function VerifierSelect(props: VerifierSelectProps) {
  return (
    <BaseStyleProvider>
      <VerifierSelectCom {...props} />
    </BaseStyleProvider>
  );
}
