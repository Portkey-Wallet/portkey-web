import PortkeyStyleProvider from '../PortkeyStyleProvider';
import SetPinCom, { SetPinBaseProps } from './index.component';
import './index.less';

export default function SetPinAndAddManager(props?: SetPinBaseProps) {
  return (
    <PortkeyStyleProvider>
      <SetPinCom {...props} />
    </PortkeyStyleProvider>
  );
}
