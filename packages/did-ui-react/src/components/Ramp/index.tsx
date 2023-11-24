import { ChainId } from '@portkey/types';
import { IRampInitState, IRampPreviewInitState, IUseHandleAchSellParams } from '../../types';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import RampMain from './index.component';

export interface IRampProps extends IUseHandleAchSellParams {
  initState?: IRampInitState;
  isBuySectionShow?: boolean;
  isSellSectionShow?: boolean;
  goBack: () => void;
  goPreview: ({ initState, chainId }: { initState: IRampPreviewInitState; chainId: ChainId }) => void;
}

export default function Ramp(props: IRampProps) {
  return (
    <PortkeyStyleProvider>
      <RampMain {...props} />
    </PortkeyStyleProvider>
  );
}
