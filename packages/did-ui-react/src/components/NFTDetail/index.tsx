import PortkeyStyleProvider from '../PortkeyStyleProvider';
import NFTDetailMain, { NFTDetailProps } from './index.component';

export default function NFTDetail(props: NFTDetailProps) {
  return (
    <PortkeyStyleProvider>
      <NFTDetailMain {...props} />
    </PortkeyStyleProvider>
  );
}
