import PortkeyStyleProvider from '../PortkeyStyleProvider';
import VerifierSelectCom, { VerifierSelectProps } from './index.component';

export default function VerifierSelect(props: VerifierSelectProps) {
  return (
    <PortkeyStyleProvider>
      <VerifierSelectCom {...props} />
    </PortkeyStyleProvider>
  );
}
