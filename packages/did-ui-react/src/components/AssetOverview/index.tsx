import PortkeyStyleProvider from '../PortkeyStyleProvider';
import AssetOverviewMain, { AssetOverviewProps } from './index.components';

export default function AssetOverview(props: AssetOverviewProps) {
  return (
    <PortkeyStyleProvider>
      <AssetOverviewMain {...props} />
    </PortkeyStyleProvider>
  );
}
