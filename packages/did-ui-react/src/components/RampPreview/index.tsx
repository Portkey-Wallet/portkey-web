import { ChainId } from '@portkey/types';
import { IRampPreviewInitState, ITokenInfo } from '../../types';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import RampPreviewMain from './index.component';

export interface IRampPreviewProps {
  initState: IRampPreviewInitState;
  portkeyServiceUrl: string;
  chainId?: ChainId;
  goBack: () => void;
  isBuySectionShow?: boolean;
  isSellSectionShow?: boolean;
}

export default function Ramp(props: IRampPreviewProps) {
  return (
    <PortkeyStyleProvider>
      <RampPreviewMain {...props} />
    </PortkeyStyleProvider>
  );
}
