import PortkeyStyleProvider from '../PortkeyStyleProvider';
import AssetMain from './index.component';

export default function Asset(props?: any) {
  return (
    <PortkeyStyleProvider>
      <AssetMain {...props} />
    </PortkeyStyleProvider>
  );
}
