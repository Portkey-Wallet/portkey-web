import PortkeyStyleProvider from '../PortkeyStyleProvider';
import SwapMain, { TSwapProps } from './index.components';

export default function Swap(props: TSwapProps) {
  return (
    <PortkeyStyleProvider>
      <SwapMain {...props} />
    </PortkeyStyleProvider>
  );
}
