import GuardianListCom, { GuardianListProps } from './index.component';
import { BaseConfigProvider } from '../config-provider';

export default function GuardianList(props: GuardianListProps) {
  return (
    <BaseConfigProvider>
      <GuardianListCom {...props} />
    </BaseConfigProvider>
  );
}
