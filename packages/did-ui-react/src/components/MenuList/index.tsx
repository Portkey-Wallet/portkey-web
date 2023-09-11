import PortkeyStyleProvider from '../PortkeyStyleProvider';
import MenuListMain, { MenuListProps } from './index.components';

export default function My(props: MenuListProps) {
  return (
    <PortkeyStyleProvider>
      <MenuListMain {...props} />
    </PortkeyStyleProvider>
  );
}
