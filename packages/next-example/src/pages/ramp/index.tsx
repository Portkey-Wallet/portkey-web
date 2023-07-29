import { ConfigProvider, Ramp } from '@portkey/did-ui-react';
import router from 'next/router';

ConfigProvider.setGlobalConfig({
  ramp: {
    isBuySectionShow: true,
    isSellSectionShow: true,
    isManagerSynced: false,
  },
  currentChain: { chainId: 'AELF', symbol: 'ELF', rpcUrl: '', type: 'aelf', getContract: (): any => {} }, // IChain & { symbol: string };
  walletInfo: {
    walletType: '',
    caAddress: '',
    balance: '',
    decimals: 8,
  },
});

export default function RampPage() {
  return (
    <div>
      <Ramp
        goBack={function (): void {
          router.push('/sign');
        }}
        goPreview={function ({ state }: any): void {
          router.push('/ramp-preview');
        }}></Ramp>
    </div>
  );
}
