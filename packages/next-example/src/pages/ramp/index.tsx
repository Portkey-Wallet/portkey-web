import { ConfigProvider, Ramp, RampPreview } from '@portkey/did-ui-react';

ConfigProvider.setGlobalConfig({
  ramp: {
    isBuySectionShow: true,
    isSellSectionShow: true,
    isManagerSynced: false,
  },
  apiUrl: '',
  currentChain: { chainId: 'AELF', symbol: 'ELF', rpcUrl: '', type: 'aelf', getContract: (): any => {} }, // IChain & { symbol: string };
  walletInfo: {
    walletType: '',
    caAddress: '',
    balance: '',
    decimals: 8,
  }, //{ walletType: string; caAddress: string; balance: string; decimals: number };
});

export default function RampPage() {
  return (
    <div>
      {/* <Ramp
        state={{
          amount: undefined,
          country: undefined,
          fiat: undefined,
          crypto: undefined,
          network: undefined,
          side: undefined,
          tokenInfo: undefined,
        }}
        goBackCallback={function (): void {}}></Ramp> */}
      <RampPreview
        state={{
          crypto: '',
        }}
        goBackCallback={function (): void {}}></RampPreview>
    </div>
  );
}
