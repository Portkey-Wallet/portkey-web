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
          goPreview={function ({ initState }): void {
            router.push(`/ramp-preview/${JSON.stringify(initState)}`);
          }}
          tokenInfo={{
            decimals: 8,
            chainId: 'AELF',
            symbol: 'ELF',
            tokenContractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
          }}
          isMainnet={true}></Ramp>
      </PortkeyAssetProvider>
    </div>
  );
}
