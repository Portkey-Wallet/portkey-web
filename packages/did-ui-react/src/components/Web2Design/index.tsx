import Web2DesignCom, { Web2DesignProps } from './index.component';
import PortkeyStyleProvider from '../PortkeyStyleProvider';

export default function Web2Design(props?: Web2DesignProps) {
  return (
    <PortkeyStyleProvider>
      <Web2DesignCom {...props} />
    </PortkeyStyleProvider>
  );
}
