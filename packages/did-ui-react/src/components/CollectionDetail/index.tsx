import PortkeyStyleProvider from '../PortkeyStyleProvider';
import CollectionDetailMain, { CollectionDetailProps } from './index.component';

export default function CollectionDetail(props: CollectionDetailProps) {
  return (
    <PortkeyStyleProvider>
      <CollectionDetailMain {...props} />
    </PortkeyStyleProvider>
  );
}
