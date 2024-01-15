import { ChainId } from '@portkey/types';
import { IRampInitState, IRampPreviewInitState, IUseHandleAchSellParams } from '../../types';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import RampMain from './index.component';
import { ITransferLimitItemWithRoute } from '../TransferSettingsEdit/index.components';

export interface IRampProps extends IUseHandleAchSellParams {
  className?: string;
  initState?: IRampInitState;
  isBuySectionShow?: boolean;
  isSellSectionShow?: boolean;
  isErrorTip?: boolean;
  onBack: () => void;
  onShowPreview: ({ initState, chainId }: { initState: IRampPreviewInitState; chainId: ChainId }) => void;
  onModifyLimit?: (data: ITransferLimitItemWithRoute) => void;
  onModifyGuardians?: () => void;
}

export default function Ramp(props: IRampProps) {
  return (
    <PortkeyStyleProvider>
      <RampMain {...props} />
    </PortkeyStyleProvider>
  );
}
