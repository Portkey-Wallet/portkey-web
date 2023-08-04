import { ChainId } from '@portkey/types';
import { IAchConfig, IRampPreviewInitState } from '../../types';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import RampPreviewMain from './index.component';

export interface IRampPreviewProps {
  initState: IRampPreviewInitState;
  chainId?: ChainId;
  portkeyServiceUrl: string;
  goBack: () => void;
  isBuySectionShow?: boolean;
  isSellSectionShow?: boolean;
  overrideAchConfig?: IAchConfig;
}

export default function Ramp(props: IRampPreviewProps) {
  return (
    <PortkeyStyleProvider>
      <RampPreviewMain {...props} />
    </PortkeyStyleProvider>
  );
}
