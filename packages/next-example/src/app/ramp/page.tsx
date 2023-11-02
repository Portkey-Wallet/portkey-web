'use client';
import { ConfigProvider, PortkeyAssetProvider, Ramp } from '@portkey/did-ui-react';
import router from 'next/router';

export default function RampPage() {
  return (
    <div>
      <PortkeyAssetProvider originChainId="AELF" pin="111111">
        <Ramp
          goBack={function (): void {
            router.push('/sign');
          }}
          goPreview={function (data): void {
            router.push(`/ramp-preview/${JSON.stringify(data)}`);
          }}
          tokenInfo={{
            decimals: 8,
            chainId: 'AELF',
            symbol: 'ELF',
            tokenContractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
          }}
          portkeyWebSocketUrl={'http://192.168.66.240:5577/ca'}
          isMainnet={true}
          isShowSelectInModal={true}
        />
      </PortkeyAssetProvider>
    </div>
  );
}
