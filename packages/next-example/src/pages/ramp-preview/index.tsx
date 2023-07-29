import { ConfigProvider, PortkeyAssetProvider, RampPreview } from '@portkey/did-ui-react';
import { Store } from '../../utils';

const myStore = new Store();

ConfigProvider.setGlobalConfig({
  storageMethod: myStore,
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
      <PortkeyAssetProvider originChainId="AELF" pin="111111">
        <RampPreview
          state={{
            crypto: '',
          }}
          goBackCallback={function (): void {}}></RampPreview>
      </PortkeyAssetProvider>
    </div>
  );
}
