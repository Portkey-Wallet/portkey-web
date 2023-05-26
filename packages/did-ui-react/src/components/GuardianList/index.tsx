import BaseStyleProvider from '../BaseStyleProvider';
import GuardianListCom, { GuardianListProps } from './index.component';

export default function GuardianList(props: GuardianListProps) {
  return (
    <BaseStyleProvider>
      <GuardianListCom {...props} />
    </BaseStyleProvider>
  );
}
