import { ChainId } from '@portkey/types';
import { IRampPreviewInitState } from '../../types';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import RampPreviewMain from './index.component';

export interface IRampPreviewProps {
  className?: string;
  initState: IRampPreviewInitState;
  portkeyServiceUrl: string;
  chainId?: ChainId;
  isMainnet: boolean;
  isBuySectionShow?: boolean;
  isSellSectionShow?: boolean;
  onBack: () => void;
}

export default function Ramp(props: IRampPreviewProps) {
  return (
    <PortkeyStyleProvider>
      <RampPreviewMain {...props} />
    </PortkeyStyleProvider>
  );
}
