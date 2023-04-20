import SetPinAndAddManagerCom, { SetPinAndAddManagerProps } from './index.component';
import { BaseConfigProvider } from '../config-provider';

export default function SetPinAndAddManager(props: SetPinAndAddManagerProps) {
  return (
    <BaseConfigProvider>
      <SetPinAndAddManagerCom {...props} />
    </BaseConfigProvider>
  );
}
