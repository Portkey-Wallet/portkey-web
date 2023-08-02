import { IRampPreviewInitState, ITokenInfo } from '../../types';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import RampPreviewMain from './index.component';

export interface IRampPreviewProps {
  initState: IRampPreviewInitState;
  tokenInfo: ITokenInfo;
  portkeyServiceUrl: string;
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
