import { ChainId } from '@portkey/types';
import { TRampInitState, TRampPreviewInitState, IUseHandleAchSellParams } from '../../types';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import RampMain from './index.component';
import { ITransferLimitItemWithRoute } from '../../types/transfer';

export interface IRampProps extends IUseHandleAchSellParams {
  isMainnet: boolean;
  className?: string;
  initState?: TRampInitState;
  isBuySectionShow?: boolean;
  isSellSectionShow?: boolean;
  isErrorTip?: boolean;
  onBack: () => void;
  onShowPreview: ({ initState, chainId }: { initState: TRampPreviewInitState; chainId: ChainId }) => void;
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
