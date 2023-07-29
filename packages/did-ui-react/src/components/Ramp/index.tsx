import PortkeyStyleProvider from '../PortkeyStyleProvider';
import RampMain from './index.component';

export interface IRampProps {
  state?: { amount: any; country: any; fiat: any; crypto: any; network: any; side: any; tokenInfo: any };
  goBack: () => void;
  goPreview: ({ state }: any) => void;
}

export default function Ramp(props: IRampProps) {
  return (
    <PortkeyStyleProvider>
      <RampMain {...props} />
    </PortkeyStyleProvider>
  );
}
