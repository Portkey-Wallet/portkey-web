import PortkeyStyleProvider from '../PortkeyStyleProvider';
import CryptoDesignCom, { CryptoDesignProps } from './index.component';

export default function CryptoDesign(props?: CryptoDesignProps) {
  return (
    <PortkeyStyleProvider>
      <CryptoDesignCom {...props} />
    </PortkeyStyleProvider>
  );
}
