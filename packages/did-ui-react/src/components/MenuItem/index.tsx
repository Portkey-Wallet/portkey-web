import PortkeyStyleProvider from '../PortkeyStyleProvider';
import MenuItemMain, { IMenuItemProps } from './index.components';

export default function MenuItem(props: IMenuItemProps) {
  return (
    <PortkeyStyleProvider>
      <MenuItemMain {...props} />
    </PortkeyStyleProvider>
  );
}
