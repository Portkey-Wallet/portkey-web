import { ChainId } from '@portkey/types';
import { IAchConfig, IRampPreviewInitState } from '../../types';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import RampPreviewMain from './index.component';

export interface IRampPreviewProps {
  initState: IRampPreviewInitState;
  portkeyServiceUrl: string;
  chainId?: ChainId;
  overrideAchConfig?: IAchConfig;
  isBuySectionShow?: boolean;
  isSellSectionShow?: boolean;
  goBack: () => void;
}

export default function Ramp(props: IRampPreviewProps) {
  return (
    <PortkeyStyleProvider>
      <RampPreviewMain {...props} />
    </PortkeyStyleProvider>
  );
}
