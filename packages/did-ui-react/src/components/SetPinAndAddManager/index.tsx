import BaseStyleProvider from '../BaseStyleProvider';
import SetPinAndAddManagerCom, { SetPinAndAddManagerProps } from './index.component';

export default function SetPinAndAddManager(props: SetPinAndAddManagerProps) {
  return (
    <BaseStyleProvider>
      <SetPinAndAddManagerCom {...props} />
    </BaseStyleProvider>
  );
}
