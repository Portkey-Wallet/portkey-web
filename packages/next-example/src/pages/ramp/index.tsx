import { ConfigProvider, PortkeyAssetProvider, Ramp } from '@portkey/did-ui-react';
import router from 'next/router';
import { Store } from '../../utils';

const myStore = new Store();

ConfigProvider.setGlobalConfig({
  storageMethod: myStore,
});

export default function RampPage() {
  return (
    <div>
      <PortkeyAssetProvider originChainId="AELF" pin="111111">
        <Ramp
          goBack={function (): void {
            router.push('/sign');
          }}
          goPreview={function ({ state }): void {
            router.push(`/ramp-preview/${JSON.stringify(state)}`);
          }}
          tokenInfo={{
            balance: '300.00',
            decimals: 8,
            chainId: 'AELF',
            symbol: 'ELF',
            tokenContractAddress: '',
          }}
          isMainnet={true}
          chainInfo={{
            caContractAddress: '',
            endPoint: '',
          }}></Ramp>
      </PortkeyAssetProvider>
    </div>
  );
}
