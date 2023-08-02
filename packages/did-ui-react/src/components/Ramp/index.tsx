import { IRampInitState, IRampPreviewInitState, ITokenInfo, IUseHandleAchSellParams } from '../../types';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import RampMain from './index.component';

export interface IRampProps extends IUseHandleAchSellParams {
  state?: IRampInitState;
  goBack: () => void;
  goPreview: ({ state }: { state: IRampPreviewInitState; tokenInfo: ITokenInfo }) => void;
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
