import BaseStyleProvider from '../BaseStyleProvider';
import SetPinCom, { SetPinBaseProps } from './index.component';
import './index.less';

export default function SetPinAndAddManager(props?: SetPinBaseProps) {
  return (
    <BaseStyleProvider>
      <SetPinCom {...props} />
    </BaseStyleProvider>
  );
}
