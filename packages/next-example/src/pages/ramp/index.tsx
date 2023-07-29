import { ConfigProvider, Ramp } from '@portkey/did-ui-react';

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
        state={{
          amount: undefined,
          country: undefined,
          fiat: undefined,
          crypto: undefined,
          network: undefined,
          side: undefined,
          tokenInfo: undefined,
        }}
        goBackCallback={function (): void {}}></Ramp>
    </div>
  );
}
