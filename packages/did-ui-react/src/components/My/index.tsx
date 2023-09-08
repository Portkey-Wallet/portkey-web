import PortkeyStyleProvider from '../PortkeyStyleProvider';
import MyMain, { MyProps } from './index.components';

export default function My(props: MyProps) {
  return (
    <PortkeyStyleProvider>
      <MyMain {...props} />
    </PortkeyStyleProvider>
  );
}
