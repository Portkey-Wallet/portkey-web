import { ChainId } from '@portkey/types';
import { IRampInitState, IRampPreviewInitState, IUseHandleAchSellParams } from '../../types';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import RampMain from './index.component';

export interface IRampProps extends IUseHandleAchSellParams {
  initState?: IRampInitState;
  goBack: () => void;
  goPreview: ({ initState, chainId }: { initState: IRampPreviewInitState; chainId: ChainId }) => void;
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
