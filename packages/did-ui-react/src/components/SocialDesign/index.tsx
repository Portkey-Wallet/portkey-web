import PortkeyStyleProvider from '../PortkeyStyleProvider';
import SocialDesignPropsCom from './index.component';
import type { SocialDesignProps } from './index.component';

export default function SocialDesign(props?: SocialDesignProps) {
  return (
    <PortkeyStyleProvider>
      <SocialDesignPropsCom {...props} />
    </PortkeyStyleProvider>
  );
}
