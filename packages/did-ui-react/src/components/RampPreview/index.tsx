import { IRampPreviewInitState } from '../../types';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import RampPreviewMain from './index.component';

export interface IRampPreviewProps {
  state: IRampPreviewInitState;
  apiUrl: string;
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
