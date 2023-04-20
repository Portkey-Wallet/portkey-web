import SetPinCom, { SetPinBaseProps } from './index.component';
import { BaseConfigProvider } from '../config-provider';
import './index.less';

export default function SetPinAndAddManager(props?: SetPinBaseProps) {
  return (
    <BaseConfigProvider>
      <SetPinCom {...props} />
    </BaseConfigProvider>
  );
}
