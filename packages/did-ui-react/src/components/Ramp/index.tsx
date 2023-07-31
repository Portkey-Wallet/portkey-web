import { IRampInitState, IRampPreviewInitState, ITokenInfo } from '../../types';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import RampMain from './index.component';

export interface IRampProps {
  state?: IRampInitState;
  tokenInfo: ITokenInfo;
  goBack: () => void;
  goPreview: ({ state }: { state: IRampPreviewInitState }) => void;
  isBuySectionShow?: boolean;
  isSellSectionShow?: boolean;
}

export default function Ramp(props: IRampProps) {
  return (
    <PortkeyStyleProvider>
      <RampMain {...props} />
    </PortkeyStyleProvider>
  );
}
