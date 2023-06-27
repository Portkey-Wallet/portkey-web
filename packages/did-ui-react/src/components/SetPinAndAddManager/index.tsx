import PortkeyStyleProvider from '../PortkeyStyleProvider';
import SetPinAndAddManagerCom, { SetPinAndAddManagerProps } from './index.component';

export default function SetPinAndAddManager(props: SetPinAndAddManagerProps) {
  return (
    <PortkeyStyleProvider>
      <SetPinAndAddManagerCom {...props} />
    </PortkeyStyleProvider>
  );
}
