import PortkeyStyleProvider from '../PortkeyStyleProvider';
import AssetMain, { AssetMainProps } from './index.component';

export default function Asset(props?: AssetMainProps) {
  return (
    <PortkeyStyleProvider>
      <AssetMain {...props} />
    </PortkeyStyleProvider>
  );
}
